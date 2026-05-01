import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { body, validationResult } from 'express-validator';

export const list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    const hotDeal = req.query.hotDeal === 'true';
    const sort = req.query.sort || '-createdAt';

    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const ids = req.query.ids;
    if (ids) filter._id = { $in: ids.split(',').filter(Boolean) };
    if (category) {
      const isMongoId = /^[a-fA-F0-9]{24}$/.test(category);
      if (isMongoId) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category }).select('_id').lean();
        filter.category = cat ? cat._id : null;
      }
    }
    if (featured) filter.featured = true;
    if (hotDeal) filter.hotDeal = true;
    if (search) filter.$text = { $search: search };

    const query = search ? Product.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }) : Product.find(filter).sort(sort);
    const [products, total] = await Promise.all([
      query.skip(skip).limit(limit).populate('category', 'name slug').lean(),
      Product.countDocuments(filter),
    ]);
    const pages = Math.ceil(total / limit);
    res.json({ products, total, pages, page });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const create = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category').isMongoId().withMessage('Valid category required'),
  body('stock').optional().isInt({ min: 0 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array().map((e) => e.msg).join('. ') });
      const { name, description, price, compareAtPrice, discountPercent, image, images, category, stock, featured, hotDeal, active, currency } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const product = await Product.create({
        name: name.trim(),
        slug,
        description,
        price,
        currency: currency || 'NPR',
        compareAtPrice,
        discountPercent: discountPercent != null ? Math.min(100, Math.max(0, Number(discountPercent))) : undefined,
        image,
        images: Array.isArray(images) ? images : [],
        category,
        stock: stock ?? 0,
        featured: !!featured,
        hotDeal: !!hotDeal,
        active: active !== false,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  },
];

export const update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const { name, description, price, compareAtPrice, discountPercent, image, images, category, stock, featured, hotDeal, active, currency } = req.body;
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (currency !== undefined) product.currency = currency;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (discountPercent !== undefined) product.discountPercent = Math.min(100, Math.max(0, Number(discountPercent)));
    if (image !== undefined) product.image = image;
    if (images !== undefined) product.images = Array.isArray(images) ? images : product.images;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (featured !== undefined) product.featured = !!featured;
    if (hotDeal !== undefined) product.hotDeal = !!hotDeal;
    if (active !== undefined) product.active = !!active;
    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
