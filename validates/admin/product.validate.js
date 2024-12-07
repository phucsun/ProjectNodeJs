module.exports.createPost = (req, res, next) => {
    if (!req.body.title) {
        req.flash("error", "Vui lòng nhập tiêu đề sản phẩm!");
        return res.redirect('back');
    }
    if (req.body.title.length < 8) {
        req.flash("error", "Tiêu đề sản phẩm phải lớn hơn 8 ký tự!");
        return res.redirect('back');
    }
    if (!req.body.price) {
        req.flash("error", "Vui lòng nhập giá sản phẩm!");
        return res.redirect('back');
    }
    next();
}