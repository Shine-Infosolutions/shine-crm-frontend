import MonthlyProjectDetails from "../models/MonthlyProjectDetail.js";

// Get all monthly project details
export const getMonthlyProjectDetails = async (req, res) => {
  try {
    const projects = await MonthlyProjectDetails.find({});
    const totalCount = projects.length;
    res.json({
      projects,
      totalCount,
      message: "Monthly project details fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single monthly project detail
export const getMonthlyProjectDetailById = async (req, res) => {
  try {
    const project = await MonthlyProjectDetails.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Monthly project detail not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new monthly project detail
export const createMonthlyProjectDetail = async (req, res) => {
  try {
    const project = await MonthlyProjectDetails.create(req.body);
    res.status(201).json({
      success: true,
      project,
      message: "Monthly project detail created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a monthly project detail by ID
export const updateMonthlyProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProject = await MonthlyProjectDetails.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProject) {
      return res
        .status(404)
        .json({ message: "Monthly project detail not found" });
    }

    res.status(200).json({ success: true, updatedProject });
  } catch (error) {
    res.status(500).json({
      message: "Error updating monthly project detail",
      error: error.message,
    });
  }
};

// Delete a monthly project detail
export const deleteMonthlyProjectDetail = async (req, res) => {
  try {
    const project = await MonthlyProjectDetails.findByIdAndDelete(
      req.params.id
    );
    if (!project) {
      return res
        .status(404)
        .json({ message: "Monthly project detail not found" });
    }
    res.json({ message: "Monthly project detail deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
