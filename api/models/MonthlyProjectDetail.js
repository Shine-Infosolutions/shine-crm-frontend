import mongoose from "mongoose";

const monthlyProjectDetailsSchema = mongoose.Schema(
  {
    monthly_project_id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
    },

    client_name: {
      type: String,
      required: true,
    },
    client_contact: {
      type: String,
      required: true,
    },
    client_email: {
      type: String,
      required: true,
    },
    project_name: {
      type: String,
      required: true,
    },
    project_type: [
      {
        type: String,
        enum: ["SEO", "SMM", "Shooting"],
        required: true,
      },
    ],

    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },

    total_amount: {
      type: Number,
      required: true,
    },
    advance_received: {
      type: Number,
      default: 0,
    },
    balance_due: {
      type: Number,
      default: function () {
        return this.total_amount - this.advance_received;
      },
    },

    deliverables: {
      posts: {
        type: Number,
        default: 0,
      },
      reels: {
        type: Number,
        default: 0,
      },
      blogs: {
        type: Number,
      },
      shooting_days: {
        type: Number,
      },
      other: {
        type: String,
      },
    },

    work_status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "On Hold"],
      default: "Not Started",
    },
    payment_status: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },

    payment_date: {
      type: Date,
    },
    project_notes: {
      type: String,
    },
    assigned_to: [
      {
        type: String,
      },
    ],

    reference_links: {
      google_drive: {
        type: String,
      },
      canva_folder: {
        type: String,
      },
      content_doc: {
        type: String,
      },
    },

    feedback_notes: {
      type: String,
    },

    created_by: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Pre-save middleware to calculate balance_due
monthlyProjectDetailsSchema.pre("save", function (next) {
  this.balance_due = this.total_amount - this.advance_received;
  next();
});

const MonthlyProjectDetails =
  mongoose.models.MonthlyProjectDetails ||
  mongoose.model("MonthlyProjectDetails", monthlyProjectDetailsSchema);

export default MonthlyProjectDetails;
