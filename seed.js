import dotenv from "dotenv";
dotenv.config(); // Loads your MONGO_URI from .env
import mongoose from "mongoose";
import Topic from "./models/Topics.js";

const topicsData = [
    // --- PHARMACOLOGY ---
    {
        topicId: "pharm-pharmacodynamics",
        topicName: "Pharmacodynamics: Receptor Mechanisms and Drug Interactions",
        courseName: "Pharmacology",
        tags: ["Pharmacodynamics", "Receptors", "Drug Action"],
        price: 500,
        isFree: false
    },
    {
        topicId: "pharm-essential-drugs",
        topicName: "Classification and Utilization of Essential Drugs in Nigeria",
        courseName: "Pharmacology",
        tags: ["Essential Drugs", "NMCN", "Classification"],
        price: 500,
        isFree: false
    },
    {
        topicId: "pharm-drug-control",
        topicName: "Pharmacokinetics and Mechanisms of Drug Control Action",
        courseName: "Pharmacology",
        tags: ["Pharmacokinetics", "Drug Control", "Absorption"],
        price: 500,
        isFree: false
    },

    // --- HUMAN ANATOMY & PHYSIOLOGY ---
    {
        topicId: "anat-endocrine-system",
        topicName: "The Endocrine System: Hormonal Pathways and Feedback Mechanisms",
        courseName: "Human Anatomy & Physiology",
        tags: ["Endocrine", "Hormones", "Homeostasis"],
        price: 500,
        isFree: false
    },
    {
        topicId: "anat-lymphatic-system",
        topicName: "Functional Anatomy of the Lymphatic and Immune Systems",
        courseName: "Human Anatomy & Physiology",
        tags: ["Lymphatic System", "Immunity", "Anatomy"],
        price: 500,
        isFree: false
    },

    // --- MEDICAL MICROBIOLOGY ---
    {
        topicId: "micro-intro-classification",
        topicName: "Introduction to Medical Microbiology and Microbial Classification",
        courseName: "Medical Microbiology",
        tags: ["Microbiology Intro", "Classification", "Microbes"],
        price: 0,
        isFree: true // A free one to hook the students!
    },
    {
        topicId: "micro-pathogens-infection",
        topicName: "Pathogenesis: Disease-Causing Microorganisms and Infection Cycles",
        courseName: "Medical Microbiology",
        tags: ["Pathogenesis", "Infection", "Microorganisms"],
        price: 500,
        isFree: false
    },

    // --- HUMAN NUTRITION ---
    {
        topicId: "nutr-micronutrient-structures",
        topicName: "Biochemical Structures and Functions of Essential Micronutrients",
        courseName: "Human Nutrition",
        tags: ["Micronutrients", "Biochemistry", "Vitamins"],
        price: 500,
        isFree: false
    },

    // --- RESEARCH METHODS ---
    {
        topicId: "research-intro-paradigms",
        topicName: "Introduction to Nursing Research: Categories and Paradigms",
        courseName: "Research Methods",
        tags: ["Nursing Research", "Categories", "Paradigms"],
        price: 500,
        isFree: false
    },
    {
        topicId: "research-methodology-chap3",
        topicName: "Research Methodology: Study Design, Population, and Sampling (Chapter 3)",
        courseName: "Research Methods",
        tags: ["Chapter 3", "Methodology", "Sampling"],
        price: 500,
        isFree: false
    },
    {
        topicId: "research-data-analysis-chap4",
        topicName: "Data Presentation, Analysis, and Interpretation (Chapter 4)",
        courseName: "Research Methods",
        tags: ["Chapter 4", "Data Analysis", "Interpretation"],
        price: 500,
        isFree: false
    },

    // --- BIOSTATISTICS ---
    {
        topicId: "biostat-correlation-regression",
        topicName: "Biostatistics: Correlation, Regression, and Inferential Statistics",
        courseName: "Biostatistics",
        tags: ["Biostatistics", "Regression", "Correlation"],
        price: 500,
        isFree: false
    },

    // --- MEDICAL SURGICAL NURSING ---
    {
        topicId: "medsurg-fluid-electrolytes",
        topicName: "Fluid, Electrolyte, and Acid-Base Imbalances",
        courseName: "Medical Surgical Nursing",
        tags: ["Fluid Balance", "Electrolytes", "Medical-Surgical"],
        price: 500,
        isFree: false
    }
];

// The Seeder Function
const seedDB = async () => {
    try {
        // 1. Connect to MongoDB
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        // 2. Clear out any old topics to prevent duplicates
        console.log("Clearing old topics...");
        await Topic.deleteMany({});

        // 3. Insert the new data
        console.log("Inserting new topics...");
        await Topic.insertMany(topicsData);

        console.log("🎉 Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        // 4. Disconnect and exit the script
        mongoose.connection.close();
        process.exit();
    }
};

// Run the function
seedDB();