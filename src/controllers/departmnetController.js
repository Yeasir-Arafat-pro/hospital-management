// controllers/departmentController.js

const createErrors    = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId }  = require('../services/findItem');
const Department      = require('../models/departmentModel');

// GET /api/departments
const handleGetAllDepartments = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const page   = parseInt(req.query.page, 10)  || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const regex  = new RegExp(search, 'i');

    const filter = {
      isActive: true,
      $or: [
        { name:        { $regex: regex } },
        { description: { $regex: regex } }
      ]
    };

    const departments = await Department.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!departments.length) {
      throw createErrors(404, 'No departments found');
    }

    const totalCount = await Department.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: 'Departments fetched successfully',
      payload: {
        departments,
        pagination: {
          totalPages:   Math.ceil(totalCount / limit),
          currentPage:  page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage:     page * limit < totalCount ? page + 1 : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/:id
const handleGetDepartmentById = async (req, res, next) => {
  try {
    const dept = await findWithId(Department, req.params.id);
    if (!dept.isActive) {
      throw createErrors(404, 'Department not found');
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Department fetched successfully',
      payload: { department: dept }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/departments
const handleCreateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    console.log(req.user);
    
    const createdBy = req.user._id; // assume auth middleware

    if (!name) {
      throw createErrors(400, 'Department name is required');
    }

    if (await Department.exists({ name })) {
      throw createErrors(409, 'A department with that name already exists');
    }

    const dept = await Department.create({ name, description, createdBy: createdBy })

    return successResponse(res, {
      statusCode: 201,
      message: 'Department created successfully',
      payload: { department: dept }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/departments/:id
const handleUpdateDepartmentById = async (req, res, next) => {
  try {
    const deptId = req.params.id;
    const updates = {};
    const updater = req.user._id;

    ['name','description','isActive'].forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    if (updates.name) {
      const conflict = await Department.findOne({ 
        name: updates.name, 
        _id:  { $ne: deptId } 
      });
      if (conflict) {
        throw createErrors(409, 'Another department with that name already exists');
      }
    }

    updates.updatedBy = updater;

    const updated = await Department.findByIdAndUpdate(
      deptId,
      { $set: updates },
      { new: true, runValidators: true }
    ).orFail(() => createErrors(404, 'Department not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Department updated successfully',
      payload: { department: updated }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/departments/:id
const handleDeleteDepartmentById = async (req, res, next) => {
  try {
    const dept = await findWithId(Department, req.params.id);
    if (!dept.isActive) {
      throw createErrors(404, 'Department not found or already deactivated');
    }
    dept.isActive = false;
    dept.updatedBy = req.user._id;
    await dept.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Department deactivated successfully',
      payload: { department: dept }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllDepartments,
  handleGetDepartmentById,
  handleCreateDepartment,
  handleUpdateDepartmentById,
  handleDeleteDepartmentById
};
