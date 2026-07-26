import dotenv from "dotenv";
dotenv.config(); // Loads your MONGO_URI from .env
import mongoose from "mongoose";
import Topic from "./models/Topics.js";

const topicsData = [
    {
        topicId: "ethics-negligence-malpractice",
        title: "Nursing Ethics: Negligence vs Malpractice",
        description: "Understand the critical legal differences, scope of practice, and how to avoid the most common NMCN ethical traps.",
        tags: ["Foundation of Nursing", "Ethics", "Law"],
        price: 0,
        isFree: true,
        content: {
            comprehensiveReview: [
                {
                    subheading: "The Foundation of Nursing Ethics",
                    paragraphText: "Nursing ethics is a branch of applied ethics that dictates professional conduct. It is built on core principles: Autonomy (respecting a patient's right to make their own decisions), Beneficence (acting in the best interest of the patient), Non-maleficence (doing no harm), and Justice (fair and equal treatment)."
                },
                {
                    subheading: "Understanding Negligence",
                    paragraphText: "Negligence is a general legal concept that denotes conduct lacking in due care. It is defined as doing something that a reasonable and prudent person would not do, or failing to do something that a reasonable person would do in a similar situation."
                },
                {
                    subheading: "Malpractice: Professional Negligence",
                    paragraphText: "Malpractice is a highly specific form of negligence. It occurs when a professional fails to meet the accepted standard of care for their specific profession, resulting in harm to the client."
                },
                {
                    subheading: "Assault vs. Battery",
                    paragraphText: "Assault is any action that places a person in reasonable fear of harmful, imminent, or offensive contact. No actual physical contact is necessary. Battery, on the other hand, is the actual intentional, unconsented touching of another person."
                }
            ],
            theCatch: "Exam Catch: NMCN examiners love to trick students with Assault vs. Battery. Remember: Threatening to force a medication on a patient is Assault. Actually forcing it down their throat is Battery."
        },
        questions: [
            {
                type: "scenario",
                questionText: "A nurse is caring for an oriented, competent adult patient who refuses to take their prescribed medication. The nurse holds up the pill cup and says, 'If you don't swallow these right now, I will force them down.' What legal tort has the nurse committed?",
                options: ["A. Battery", "B. Assault", "C. Negligence", "D. False Imprisonment"],
                correctAnswer: "B. Assault",
                rationale: "Assault is the intentional threat to bring about harmful or offensive contact. Since the nurse only threatened the action and caused fear, it is assault."
            },
            {
                type: "scenario",
                questionText: "After administering an intravenous sedative, the nurse forgets to raise the bed's side rails. The patient falls and sustains a fractured hip. This scenario best illustrates:",
                options: ["A. Malpractice", "B. Battery", "C. Assault", "D. Criminal intent"],
                correctAnswer: "A. Malpractice",
                rationale: "Malpractice is professional negligence. The nurse breached their professional duty of care, directly causing harm."
            }
        ]
    },
    {
        topicId: "repro-rights-minor",
        title: "Reproductive Rights & Minor Confidentiality",
        description: "Master the ethico-legal boundaries of treating adolescents in family planning clinics in Nigeria.",
        tags: ["Reproductive Health", "Ethics", "Pediatrics"],
        price: 500,
        isFree: false,
        content: {
            comprehensiveReview: [
                {
                    subheading: "Overview of Reproductive Health",
                    paragraphText: "Reproductive health implies that people are able to have a satisfying and safe sex life, the capability to reproduce, and the freedom to decide if, when, and how often to do so."
                }
            ],
            theCatch: "In NMCN exams, if a scenario involves a minor seeking reproductive health services, the nurse's FIRST action is to assess the client's understanding and risk, NOT immediately calling the parents."
        },
        questions: [
            {
                type: "scenario",
                questionText: "A 16-year-old female visits the clinic requesting oral contraceptives and asks the nurse not to tell her parents. What is the most appropriate initial action?",
                options: [
                    "A. Refuse service until parental consent is obtained",
                    "B. Assess the teenager's level of maturity and understanding of the medication",
                    "C. Secretly call the parents to inform them",
                    "D. Dispense the medication immediately"
                ],
                correctAnswer: "B. Assess the teenager's level of maturity and understanding of the medication",
                rationale: "Before breaching confidentiality, the nurse must assess the minor's maturity and understanding of the implications (Gillick competence)."
            }
        ]
    },
    {
        topicId: "pharma-digoxin",
        title: "Digoxin Toxicity & Management",
        description: "Recognize early signs of toxicity, therapeutic ranges, and the nursing interventions required.",
        tags: ["Pharmacology", "Cardiovascular", "Critical Care"],
        price: 500,
        isFree: false,
        content: null,
        questions: [
            {
                type: "recall",
                questionText: "Which of the following is an early sign of Digoxin toxicity that a nurse should closely monitor for?",
                options: ["A. Hypertension", "B. Increased appetite", "C. Visual disturbances (yellow halos)", "D. Tachycardia"],
                correctAnswer: "C. Visual disturbances (yellow halos)",
                rationale: "Visual disturbances, particularly seeing yellow or green halos around lights, along with nausea, are classic early signs of digoxin toxicity."
            }
        ]
    },
    {
        topicId: "nutrition-enteral-parenteral",
        title: "Enteral vs. Parenteral Nutrition",
        description: "Master the indications, complications, and nursing management of tube feeding vs. IV nutrition.",
        tags: ["Nutrition & Dietetics", "Medical-Surgical", "Fundamentals"],
        price: 500,
        isFree: false,
        content: {
            comprehensiveReview: [
                {
                    subheading: "The Golden Rule of Nutrition",
                    paragraphText: "The golden rule in clinical nutrition is: 'If the gut works, use it.' Enteral nutrition (via NG, ND, NJ, or PEG tubes) uses the gastrointestinal tract. It preserves gut flora, maintains intestinal mucosa integrity, and is significantly cheaper and safer than parenteral nutrition."
                },
                {
                    subheading: "Total Parenteral Nutrition (TPN)",
                    paragraphText: "Parenteral nutrition bypasses the GI tract entirely, delivering nutrients directly into the bloodstream via a central venous catheter (like a PICC line). It is strictly reserved for patients with non-functioning GI tracts (e.g., severe burns, paralytic ileus, massive bowel resection)."
                },
                {
                    subheading: "Complications to Monitor",
                    paragraphText: "For Enteral feeds, the highest risk is aspiration pneumonia. Always elevate the head of the bed to 30-45 degrees. For Parenteral feeds, the highest risks are central line infections (sepsis) and massive fluid/electrolyte shifts, particularly hyperglycemia and refeeding syndrome."
                }
            ],
            theCatch: "Exam Catch: If an NMCN question asks what to do if a TPN bag runs out before the next one arrives from the pharmacy, ALWAYS hang 10% Dextrose in water (D10W). Never just stop TPN abruptly or flush with normal saline, as this causes severe rebound hypoglycemia."
        },
        questions: [
            {
                type: "scenario",
                questionText: "A patient receiving Total Parenteral Nutrition (TPN) suddenly runs out of the solution, and the pharmacy says the next bag will take an hour to prepare. What is the priority nursing action?",
                options: [
                    "A. Hang 0.9% Normal Saline at the same rate",
                    "B. Stop the infusion and lock the central line",
                    "C. Hang 10% Dextrose in Water (D10W) at the same rate",
                    "D. Administer a bolus of regular insulin"
                ],
                correctAnswer: "C. Hang 10% Dextrose in Water (D10W) at the same rate",
                rationale: "TPN contains high glucose concentrations. Stopping it abruptly causes the pancreas, which is secreting high levels of insulin, to induce severe rebound hypoglycemia. D10W prevents this crash."
            }
        ]
    },
    {
        topicId: "psych-defense-mechanisms",
        title: "Understanding Defense Mechanisms",
        description: "Identify and differentiate between projection, displacement, reaction formation, and rationalization.",
        tags: ["Clinical Psychology", "Mental Health", "Psychiatry"],
        price: 500,
        isFree: false,
        content: {
            comprehensiveReview: [
                {
                    subheading: "What are Defense Mechanisms?",
                    paragraphText: "Defense mechanisms are unconscious psychological strategies used to cope with reality and maintain self-image. While everyone uses them, over-reliance can lead to maladaptive behavior."
                },
                {
                    subheading: "Displacement vs. Projection",
                    paragraphText: "Displacement redirects an emotion from a dangerous target to a safe one (e.g., a nurse yelled at by a doctor goes and yells at the ward maid). Projection involves attributing one's own unacceptable feelings onto someone else (e.g., a student who hates their lecturer claims 'the lecturer hates me')."
                },
                {
                    subheading: "Reaction Formation",
                    paragraphText: "This occurs when a person behaves in the exact opposite manner to how they truly feel because the true feeling is unacceptable. For example, a mother who secretly resents her unplanned child becomes overly protective and suffocating."
                }
            ],
            theCatch: "Exam Catch: Do not confuse Rationalization with Intellectualization. Rationalization makes excuses to justify behavior ('I failed because the exam was unfair'). Intellectualization uses academic/clinical jargon to avoid feeling pain ('The statistical probability of my diagnosis is...')."
        },
        questions: [
            {
                type: "scenario",
                questionText: "A patient diagnosed with terminal cancer spends all day researching clinical trial statistics and the exact cellular mechanisms of their tumor, showing absolutely no sadness or anger. Which defense mechanism are they primarily displaying?",
                options: [
                    "A. Denial",
                    "B. Rationalization",
                    "C. Intellectualization",
                    "D. Reaction Formation"
                ],
                correctAnswer: "C. Intellectualization",
                rationale: "Intellectualization involves stripping an event of its emotional impact by focusing exclusively on logic, data, and academic details."
            }
        ]
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