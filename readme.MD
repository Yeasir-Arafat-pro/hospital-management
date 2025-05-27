### Ecommerce mern project

# Ready file & folder
-> set express-rate-limit xss-clean http-errors

## Helper file
# create Jwt helper 
> create function
> check typeof object & string then create errror
>  then tryCatch block
> then jwt.sign(payload, key, expiresIn)


# process register for User -> /api/users/process-register
> distructuring data from Req Body
> User Exist with email -> isExist then create error
> create json web token              
> create send email data
> data send with nodemailer

# Activate User Account with register token ->/api/users/verify
> get token from req.body
> if token not empty
> decode jwt.verify (token, key)
> if decode data not empty
> isExist decode.email in User.email
> Finally User.create(decode)


