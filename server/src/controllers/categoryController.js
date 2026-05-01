import Category from '../models/Category.js';

/**
  * GET /api/categories - List all categories (public). Optional ?tree=1 for nested structure.
 */
export const list = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).populate('parent', 'name slug').lean();
    const tree = req.query.tree === '1';
    if (tree) {
      const byId = new Map(categories.map((c) => [c._id.toString(), { ...c, children: [] }]));
      const roots = [];
      categories.forEach((c) => {
        const node = byId.get(c._id.toString());
        if (!c.parent) roots.push(node);
        else {
          const p = byId.get(c.parent._id?.toString() || c.parent?.toString());
          if (p) p.children.push(node);
          else roots.push(node);
        }
      });
      return res.json(roots);
    }
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/categories/:id - Get one category (public).
 */
export const getOne = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/categories - Create category or subcategory (admin).
 */
export const create = async (req, res, next) => {
  try {
    const { name, description, image, parent } = req.body;
    const baseSlug = (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!baseSlug) return res.status(400).json({ message: 'Name is required' });
    let slug = baseSlug;
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (parentCat) slug = parentCat.slug + '-' + baseSlug;
    }
    let existing = await Category.findOne({ slug });
    let suffix = 0;
    while (existing) {
      suffix += 1;
      slug = (parent ? slug.replace(/-[0-9]+$/, '') : baseSlug) + (suffix > 1 ? '-' + suffix : '');
      existing = await Category.findOne({ slug });
    }
    const category = await Category.create({ name: name.trim(), slug, description, image, parent: parent || null });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Category with this name/slug already exists' });
    next(err);
  }
};

/**
 * PUT /api/categories/:id - Update category (admin).
 */
export const update = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { name, description, image, parent } = req.body;
    if (name) {
      category.name = name.trim();
      const baseSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const parentId = category.parent?._id || category.parent;
      if (parentId) {
        const parentCat = await Category.findById(parentId);
        category.slug = (parentCat?.slug || baseSlug) + '-' + baseSlug;
      } else category.slug = baseSlug;
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent || null;
    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/categories/:id - Delete category (admin).
 */
export const remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
