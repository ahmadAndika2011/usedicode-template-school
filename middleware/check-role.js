module.exports.checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.session.user

        if(!user){
            return res.redirect("/")
        }

        if(!allowedRoles.includes(user.role)){
            return res.redirect("/")
        }

        next()
    }
}