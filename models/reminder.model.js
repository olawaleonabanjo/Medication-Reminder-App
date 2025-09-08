import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  medicationName: { 
    type: String, 
    required: true 
},
  dosage: { 
    type: String 
  , required: true 
},
  frequency: { 
    type: String, 
    enum: ["daily", "weekly", "monthly"], 
    required: true 
},
  time: { 
    type: String, 
    required: true 
},
  startDate: { 
    type: Date, 
    default: Date.now 
}
}, { timestamps: true });

const Reminder = mongoose.model("Reminder", reminderSchema);


export default Reminder;
