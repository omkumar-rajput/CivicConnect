// Category management controller
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint categories',
    });
  }
};

// @desc    Add a new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, department, description, icon } = req.body;

    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name and Department are required',
      });
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }

    const category = await Category.create({
      name,
      department,
      description: description || '',
      icon: icon || 'bi-exclamation-diamond',
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

// @desc    Delete/Deactivate category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
    });
  }
};
