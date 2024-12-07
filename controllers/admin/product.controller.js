const systemConfig = require("../../config/system")
// [GET] /admin/products
const Product = require("../../models/product.model")
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")


module.exports.index = async(req, res) => {
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: false,
    };
    if(req.query.status) {
        find.status = req.query.status;
    }
    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }

    const countsProduct = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countsProduct
    );
    
    const products = await Product.find(find)
    .sort({position: "desc"})
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
    res.render("admin/pages/products/index", {
        pageTitle: "Trang danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

//[GET] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({_id: id}, {status : status});
    req.flash("success", "Cập nhật trạng thái sản phẩm thành công!");

    res.redirect('back');
}

module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch(type) {
        case "active":
            await Product.updateMany({_id: {$in: ids}} , {status: "active"});
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "inactive":
            await Product.updateMany({_id: {$in: ids}} , {status: "inactive"});
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`);
            break;
        case "delete-all":
            await Product.updateMany({_id: {$in: ids}}, {
                deleted: true,
                deleteAt: new Date()
            });
            req.flash("success", `Đã xóa thành công ${ids.length} sản phẩm!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);
                await Product.updateOne({_id: id}, {position : position});
            }
            break;
        default:
            break;
    }
    res.redirect('back');
}

module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    //await Product.deleteOne({_id: id});   
    await Product.updateOne({_id: id}, { 
        deleted: true,
        deleteAt: new Date()
    });
    req.flash("success", `Đã xóa thành công sản phẩm!`);
    res.redirect('back');
};

module.exports.create = async (req, res) => {
    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm"
    })
};

module.exports.createPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == "") {
        const countsProduct = await Product.countDocuments();
        req.body.position = countsProduct + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }
    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    const product = new Product(req.body);
    try {
        await product.save();
        req.flash("success", "Thêm mới sản phẩm thành công!");
    } catch (error) {
        req.flash("error", "Thêm mới sản phẩm thất bại!");
    }

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};

module.exports.edit = async (req, res) => {
    try {
        const find = {
            _id: req.params.id,
            deleted: false
        };
        const product = await Product.findOne(find);
    
        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product
        });
    } catch (error) {
        req.flash("error", "Không tìm thấy sản phẩm!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
};

module.exports.editPost = async (req, res) => {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);
    if (req.file) {
        req.body.thumbnail = `uploads/${req.file.filename}`;
    }
    try {
        await Product.updateOne({_id: req.params.id} , req.body);
        req.flash("success", "Cập nhật sản phẩm thành công!");
    } catch (error) {
        req.flash("error", "Cập nhật that bại!");
    }
    
    res.redirect("back");
}

module.exports.detail = async (req, res) => {
    try {
        const find = {
            _id: req.params.id,
            deleted: false
        };
        const product = await Product.findOne(find);
        res.render("admin/pages/products/detail", {
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        req.flash("error", "Sản phẩm lỗi!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

