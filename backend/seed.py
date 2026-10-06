import random
import uuid
from datetime import date, timedelta

PLATFORMS = ["Udemy", "Coursera", "upGrad", "Great Learning", "Scaler", "Simplilearn", "NPTEL", "Skill-Lync", "Offline Institute"]
DOMAINS = ["Software & Data", "Civil", "Mechanical", "Electronics", "Architecture", "Biomedical", "Management"]
CATEGORY_DOMAIN = {"Product Management": "Management", "Civil Engineering": "Civil", "Mechanical Engineering": "Mechanical",
                   "Electronics": "Electronics", "Architecture": "Architecture", "Biomedical Engineering": "Biomedical"}


def domain_for(category):
    return CATEGORY_DOMAIN.get(category, "Software & Data")

# name, category, headline, years, industry role, bio, skills, {platform: [courses]}, [(course, platform, start, mode)]
INSTRUCTORS = [
    ("Rohan Mehta", "Data Engineering", "Builds data pipelines by day, teaches them by night", 12, "Principal Data Engineer, Flipkart",
     "Rohan has designed petabyte-scale pipelines for e-commerce and payments. He teaches the way he builds: start from the business question, then pick the tool.",
     ["Apache Spark", "Airflow", "Kafka", "Data Modelling", "SQL", "Databricks"],
     {"Udemy": ["Apache Spark 3 for Data Engineers", "Airflow in Production"], "upGrad": ["PG Diploma in Data Engineering"]},
     [("Apache Spark 3 for Data Engineers", "Udemy", "2026-07-12", "Weekend"), ("PG Diploma in Data Engineering", "upGrad", "2026-08-03", "Online")]),
    ("Kavya Iyer", "Data Engineering", "Making the modern data stack feel simple", 8, "Staff Data Engineer, Razorpay",
     "Kavya moved from analytics to engineering and remembers exactly what confused her. Her classes are heavy on SQL, dbt and real warehouse design.",
     ["dbt", "Snowflake", "SQL", "Data Warehousing", "Python", "Airflow"],
     {"Coursera": ["Modern Data Stack with dbt and Snowflake"], "Great Learning": ["Data Engineering Bootcamp"], "Offline Institute": ["Weekend SQL Mastery, Bengaluru"]},
     [("Weekend SQL Mastery, Bengaluru", "Offline Institute", "2026-07-05", "Weekend")]),
    ("Arjun Nambiar", "Data Engineering", "Streaming systems, explained from first principles", 15, "Ex-Architect, Walmart Labs",
     "Arjun spent a decade on real-time systems and now teaches full time. Expect whiteboards, trade-offs and very few slides.",
     ["Kafka", "Flink", "Apache Spark", "System Design", "Scala", "AWS"],
     {"Scaler": ["Real-time Data Engineering"], "Udemy": ["Kafka Deep Dive", "Stream Processing with Flink"]},
     [("Real-time Data Engineering", "Scaler", "2026-07-20", "Online")]),

    ("Priya Raghavan", "Data Science", "From spreadsheets to statistical thinking", 10, "Lead Data Scientist, Swiggy",
     "Priya teaches statistics and machine learning to working professionals, with a focus on asking the right question before touching a model.",
     ["Machine Learning", "Statistics", "Python", "Pandas", "scikit-learn", "A/B Testing"],
     {"Great Learning": ["PG Program in Data Science", "Statistics for Business"], "Coursera": ["Applied Machine Learning in Python"]},
     [("PG Program in Data Science", "Great Learning", "2026-07-15", "Weekend"), ("Applied Machine Learning in Python", "Coursera", "2026-08-10", "Online")]),
    ("Siddharth Kulkarni", "Data Science", "Deep learning without the hand-waving", 9, "Senior ML Engineer, Microsoft India",
     "Siddharth builds vision and NLP models at scale and teaches deep learning with an engineer's eye for what actually ships.",
     ["Deep Learning", "PyTorch", "Computer Vision", "NLP", "MLOps", "Python"],
     {"Udemy": ["PyTorch for Deep Learning", "Computer Vision Projects"], "upGrad": ["Advanced Certificate in Deep Learning"]},
     [("PyTorch for Deep Learning", "Udemy", "2026-07-08", "Online")]),
    ("Neha Bansal", "Data Science", "Analytics that changes decisions, not just dashboards", 7, "Analytics Manager, Zomato",
     "Neha teaches business analytics and experimentation. Her learners leave knowing how to defend a number in a meeting.",
     ["Business Analytics", "SQL", "Power BI", "A/B Testing", "Python", "Storytelling with Data"],
     {"Simplilearn": ["Business Analytics Masterclass"], "Coursera": ["Data Analysis for Decision Makers"], "Offline Institute": ["Analytics Weekend Cohort, Gurugram"]},
     [("Analytics Weekend Cohort, Gurugram", "Offline Institute", "2026-07-11", "Weekend"), ("Business Analytics Masterclass", "Simplilearn", "2026-08-01", "Online")]),

    ("Aditya Verma", "GenAI and LLMs", "Shipping LLM apps, not just demos", 11, "Head of Applied AI, Freshworks",
     "Aditya has taken several LLM products to production and teaches the parts tutorials skip: evaluation, cost, latency and guardrails.",
     ["LLMs", "RAG", "LangChain", "Prompt Engineering", "Vector Databases", "Python"],
     {"Udemy": ["Building Production RAG Systems", "LLM Engineering Essentials"], "Scaler": ["GenAI for Engineers"]},
     [("Building Production RAG Systems", "Udemy", "2026-07-06", "Online"), ("GenAI for Engineers", "Scaler", "2026-07-25", "Weekend")]),
    ("Shruti Deshpande", "GenAI and LLMs", "Fine-tuning and evaluation made approachable", 8, "Research Engineer, Sarvam AI",
     "Shruti works on Indic language models and teaches fine-tuning, evaluation and responsible deployment with a research-grade rigour.",
     ["Fine-tuning", "Transformers", "LLM Evaluation", "PyTorch", "Hugging Face", "NLP"],
     {"Coursera": ["Fine-tuning Large Language Models"], "Great Learning": ["Generative AI Program"]},
     [("Generative AI Program", "Great Learning", "2026-08-02", "Weekend")]),
    ("Vikram Sethi", "GenAI and LLMs", "GenAI for people who have never written a model", 14, "Ex-Director of Engineering, Adobe",
     "Vikram teaches GenAI to product managers, analysts and senior engineers who need to make decisions about it, not just code it.",
     ["Prompt Engineering", "AI Agents", "RAG", "AI Product Strategy", "OpenAI APIs", "No-code AI"],
     {"upGrad": ["GenAI for Leaders"], "Udemy": ["AI Agents from Scratch", "Prompt Engineering Masterclass"], "Offline Institute": ["GenAI Weekend Lab, Pune"]},
     [("GenAI Weekend Lab, Pune", "Offline Institute", "2026-07-18", "Weekend")]),

    ("Manish Agarwal", "Cloud", "AWS certifications with real architecture behind them", 13, "Cloud Architect, Infosys",
     "Manish has migrated banks and insurers to AWS. His courses pair certification prep with the architecture judgement interviewers look for.",
     ["AWS", "Solutions Architecture", "Terraform", "Networking", "Serverless", "Cost Optimisation"],
     {"Udemy": ["AWS Solutions Architect Associate", "AWS Serverless in Practice"], "Simplilearn": ["Cloud Architect Masters Program"]},
     [("AWS Solutions Architect Associate", "Udemy", "2026-07-13", "Weekend")]),
    ("Divya Krishnan", "Cloud", "Azure for enterprise teams, taught plainly", 9, "Senior Cloud Engineer, TCS",
     "Divya teaches Azure and hybrid cloud for professionals coming from on-prem IT. Lots of labs, lots of patience.",
     ["Azure", "Kubernetes", "Networking", "Identity and Access", "Bicep", "DevOps"],
     {"Coursera": ["Microsoft Azure Fundamentals to Architect"], "Great Learning": ["Cloud Computing PG Program"], "Offline Institute": ["Azure Bootcamp, Chennai"]},
     [("Azure Bootcamp, Chennai", "Offline Institute", "2026-07-04", "Offline"), ("Cloud Computing PG Program", "Great Learning", "2026-08-08", "Online")]),
    ("Rahul Chawla", "Cloud", "Multi-cloud, cost and reliability for startups", 10, "Founding Engineer, CRED",
     "Rahul has run infrastructure at two unicorns and teaches cloud the way startups actually use it: fast, cheap and observable.",
     ["AWS", "GCP", "Kubernetes", "Terraform", "Observability", "Cost Optimisation"],
     {"Scaler": ["Cloud Infrastructure for Startups"], "Udemy": ["Terraform on AWS and GCP"]},
     [("Cloud Infrastructure for Startups", "Scaler", "2026-07-22", "Online")]),

    ("Ankit Sharma", "Full Stack", "React and Node, the way product teams write it", 9, "Engineering Manager, Meesho",
     "Ankit teaches full stack development with a product mindset. Every cohort ships a real app with auth, payments and deployment.",
     ["React", "Node.js", "TypeScript", "PostgreSQL", "System Design", "Next.js"],
     {"Scaler": ["Full Stack Developer Program"], "Udemy": ["React and TypeScript Bootcamp", "Node.js APIs in Production"]},
     [("Full Stack Developer Program", "Scaler", "2026-07-14", "Online"), ("React and TypeScript Bootcamp", "Udemy", "2026-07-26", "Weekend")]),
    ("Pooja Hegde", "Full Stack", "Frontend craft for engineers who care about users", 7, "Senior Frontend Engineer, Atlassian",
     "Pooja focuses on frontend performance, accessibility and design systems. Her reviews of learner projects are famously detailed.",
     ["React", "JavaScript", "CSS", "Accessibility", "Performance", "Design Systems"],
     {"Udemy": ["Modern Frontend Engineering"], "Coursera": ["Web Accessibility and Performance"], "Offline Institute": ["Frontend Weekend Studio, Bengaluru"]},
     [("Frontend Weekend Studio, Bengaluru", "Offline Institute", "2026-07-05", "Weekend")]),
    ("Karthik Subramanian", "Full Stack", "Java and Spring Boot for enterprise careers", 16, "Ex-Technical Architect, Cognizant",
     "Karthik has trained over 4,000 engineers in Java and microservices. His courses are structured, exam-friendly and interview-focused.",
     ["Java", "Spring Boot", "Microservices", "REST APIs", "Hibernate", "Angular"],
     {"Simplilearn": ["Full Stack Java Developer"], "upGrad": ["Software Engineering PG Program"], "Udemy": ["Spring Boot Microservices"]},
     [("Full Stack Java Developer", "Simplilearn", "2026-07-10", "Online"), ("Spring Boot Microservices", "Udemy", "2026-08-05", "Weekend")]),

    ("Sameer Joshi", "DevOps", "CI/CD and Kubernetes without the fear", 11, "Platform Lead, PhonePe",
     "Sameer runs platform engineering for a payments app and teaches DevOps through incidents he has actually lived through.",
     ["Kubernetes", "Docker", "CI/CD", "GitHub Actions", "Helm", "Linux"],
     {"Udemy": ["Kubernetes for Developers", "CI/CD with GitHub Actions"], "Great Learning": ["DevOps Engineer Program"]},
     [("Kubernetes for Developers", "Udemy", "2026-07-09", "Online")]),
    ("Ritu Malhotra", "DevOps", "Site reliability, taught by someone on call", 8, "SRE, Google India",
     "Ritu teaches SRE practices, observability and incident response. Learners run a mock on-call rotation during the course.",
     ["SRE", "Observability", "Prometheus", "Grafana", "Incident Response", "Kubernetes"],
     {"Coursera": ["Site Reliability Engineering Fundamentals"], "Scaler": ["DevOps and SRE Program"]},
     [("DevOps and SRE Program", "Scaler", "2026-07-27", "Weekend")]),
    ("Nikhil Pillai", "DevOps", "Infrastructure as code, start to finish", 12, "DevOps Consultant, ex-Wipro",
     "Nikhil consults for mid-size companies moving to automated infrastructure and teaches Terraform, Ansible and cloud pipelines.",
     ["Terraform", "Ansible", "AWS", "Jenkins", "Docker", "Shell Scripting"],
     {"Simplilearn": ["DevOps Engineer Masters Program"], "Udemy": ["Terraform Zero to Hero", "Ansible for Real Teams"], "Offline Institute": ["DevOps Weekend Bootcamp, Hyderabad"]},
     [("DevOps Weekend Bootcamp, Hyderabad", "Offline Institute", "2026-07-11", "Weekend"), ("Terraform Zero to Hero", "Udemy", "2026-08-02", "Online")]),

    ("Farhan Qureshi", "Cybersecurity", "Ethical hacking with discipline and ethics", 10, "Security Lead, Paytm",
     "Farhan leads application security at a fintech and teaches penetration testing with a strong emphasis on responsible practice.",
     ["Penetration Testing", "Web Security", "OWASP", "Network Security", "Burp Suite", "Linux"],
     {"Udemy": ["Web Application Penetration Testing", "Ethical Hacking Essentials"], "Great Learning": ["Cybersecurity PG Program"]},
     [("Web Application Penetration Testing", "Udemy", "2026-07-16", "Online")]),
    ("Lakshmi Venkatesh", "Cybersecurity", "Cloud security and compliance for real companies", 13, "CISO, mid-size SaaS company",
     "Lakshmi has built security programs from scratch and teaches cloud security, governance and compliance to IT professionals.",
     ["Cloud Security", "AWS", "Compliance", "IAM", "Risk Management", "Zero Trust"],
     {"Coursera": ["Cloud Security Specialisation"], "Simplilearn": ["CISSP Preparation"], "Offline Institute": ["Security Leadership Workshop, Mumbai"]},
     [("Security Leadership Workshop, Mumbai", "Offline Institute", "2026-07-19", "Offline")]),
    ("Gaurav Saxena", "Cybersecurity", "Blue team skills for your first security job", 7, "SOC Analyst Lead, Deloitte India",
     "Gaurav teaches defensive security, SIEM and threat hunting to freshers and career changers, with a clear path to SOC roles.",
     ["SIEM", "Threat Hunting", "Incident Response", "Splunk", "Network Security", "Python"],
     {"upGrad": ["Cybersecurity Certificate Program"], "Udemy": ["SOC Analyst Bootcamp"]},
     [("SOC Analyst Bootcamp", "Udemy", "2026-07-07", "Weekend"), ("Cybersecurity Certificate Program", "upGrad", "2026-08-09", "Online")]),

    ("Anjali Menon", "Product Management", "Product thinking for engineers moving into PM", 11, "Director of Product, PhonePe",
     "Anjali transitioned from engineering to product and now teaches that exact journey: discovery, prioritisation and shipping with teams.",
     ["Product Strategy", "User Research", "Roadmapping", "Metrics", "Stakeholder Management", "Agile"],
     {"upGrad": ["Product Management Certification"], "Udemy": ["Product Management for Engineers"], "Offline Institute": ["PM Weekend Circle, Bengaluru"]},
     [("PM Weekend Circle, Bengaluru", "Offline Institute", "2026-07-12", "Weekend")]),
    ("Varun Kapoor", "Product Management", "Growth and experimentation, from a practitioner", 9, "VP Growth, Groww",
     "Varun teaches growth product management: funnels, experiments and retention. Every lecture uses live data from a real product.",
     ["Growth", "A/B Testing", "Analytics", "Product Strategy", "SQL", "Monetisation"],
     {"Great Learning": ["Growth Product Management"], "Coursera": ["Experimentation for Product Teams"]},
     [("Growth Product Management", "Great Learning", "2026-07-21", "Online")]),
    ("Sneha Reddy", "Product Management", "Zero to one: building products that find a market", 8, "Founder and ex-PM, Flipkart",
     "Sneha has built two products from scratch and teaches early-stage product work: discovery, MVPs and the first hundred customers.",
     ["Product Discovery", "MVP Design", "User Research", "Pricing", "Go-to-Market", "Figma"],
     {"Scaler": ["Product Management Program"], "Udemy": ["Zero to One Product Management", "User Research that Works"]},
     [("Product Management Program", "Scaler", "2026-07-28", "Weekend"), ("User Research that Works", "Udemy", "2026-08-06", "Online")]),

    ("Suresh Balakrishnan", "Civil Engineering", "Structural design you can defend in a site meeting", 18, "Senior Structural Engineer, L&T Construction",
     "Suresh has designed high-rises, bridges and industrial sheds across India. He teaches RCC and steel design the way reviewers check it: code clause by code clause.",
     ["Structural Design", "RCC Design", "STAAD.Pro", "ETABS", "IS Codes", "Steel Structures"],
     {"NPTEL": ["Design of Reinforced Concrete Structures"], "Skill-Lync": ["Structural Analysis with ETABS"], "Offline Institute": ["Structural Design Weekend Studio, Chennai"]},
     [("Structural Analysis with ETABS", "Skill-Lync", "2026-07-19", "Online"), ("Structural Design Weekend Studio, Chennai", "Offline Institute", "2026-08-01", "Weekend")]),
    ("Meenakshi Sundaram", "Civil Engineering", "Construction management from real project sites", 14, "Project Manager, Shapoorji Pallonji",
     "Meenakshi has delivered metro stations and hospitals on schedule. She teaches planning, costing and contracts with documents from real projects.",
     ["Construction Management", "Primavera P6", "Project Scheduling", "Cost Estimation", "Site Safety", "Contracts"],
     {"Coursera": ["Construction Project Management"], "NPTEL": ["Construction Planning and Control"], "Udemy": ["Primavera P6 for Site Engineers"]},
     [("Primavera P6 for Site Engineers", "Udemy", "2026-07-14", "Online")]),

    ("Harish Gowda", "Mechanical Engineering", "CAD/CAM from sketch to shop floor", 12, "Design Lead, Bosch India",
     "Harish designs precision components and teaches CAD, GD&T and CNC programming with parts that learners actually get machined.",
     ["SolidWorks", "CATIA", "CNC Programming", "GD&T", "CAM", "Manufacturing Processes"],
     {"Skill-Lync": ["CAD/CAM Masterclass"], "Udemy": ["SolidWorks for Mechanical Engineers", "CNC Programming Basics"], "Offline Institute": ["CAD Lab Weekends, Bengaluru"]},
     [("CAD/CAM Masterclass", "Skill-Lync", "2026-07-13", "Online"), ("CAD Lab Weekends, Bengaluru", "Offline Institute", "2026-07-26", "Weekend")]),
    ("Ayesha Siddiqui", "Mechanical Engineering", "Automotive design with an engineer's judgement", 10, "Vehicle Integration Engineer, Tata Motors",
     "Ayesha works on EV platforms and teaches automotive design, FEA and vehicle dynamics with trade-offs from real vehicle programmes.",
     ["Automotive Design", "Vehicle Dynamics", "FEA", "ANSYS", "Powertrain", "EV Systems"],
     {"Skill-Lync": ["Automotive Design and Analysis"], "Coursera": ["Electric Vehicle Engineering"], "NPTEL": ["Vehicle Dynamics"]},
     [("Automotive Design and Analysis", "Skill-Lync", "2026-08-04", "Online")]),

    ("Ramesh Chandran", "Electronics", "VLSI and embedded systems, from transistor to firmware", 16, "Principal Engineer, Texas Instruments India",
     "Ramesh has taped out several chips and written firmware for them. He teaches digital design and embedded C with boards in every learner's hands.",
     ["VLSI Design", "Verilog", "Embedded C", "Microcontrollers", "RTOS", "PCB Design"],
     {"NPTEL": ["Digital VLSI Design"], "Udemy": ["Embedded Systems with ARM Cortex-M", "Verilog for FPGA"], "Offline Institute": ["Embedded Weekend Lab, Hyderabad"]},
     [("Embedded Systems with ARM Cortex-M", "Udemy", "2026-07-17", "Online"), ("Embedded Weekend Lab, Hyderabad", "Offline Institute", "2026-08-08", "Weekend")]),

    ("Nandita Rao", "Architecture", "Revit and BIM for architects who want faster, cleaner drawings", 11, "BIM Manager, CP Kukreja Architects",
     "Nandita runs BIM for large institutional projects and teaches Revit and coordination workflows that cut drawing time in half.",
     ["Revit", "BIM", "AutoCAD", "Construction Documentation", "Navisworks", "Parametric Design"],
     {"Udemy": ["Revit Architecture Complete Course"], "Skill-Lync": ["BIM for Architects"], "Offline Institute": ["BIM Studio Weekends, Delhi"]},
     [("BIM for Architects", "Skill-Lync", "2026-07-21", "Online"), ("BIM Studio Weekends, Delhi", "Offline Institute", "2026-08-02", "Weekend")]),
    ("Imran Shaikh", "Architecture", "Sustainable design that satisfies both the client and the climate", 13, "Principal Architect, Studio Verdant",
     "Imran designs green-rated buildings and teaches passive design, daylighting and certification with his own projects as case studies.",
     ["Sustainable Design", "Green Building", "Passive Cooling", "IGBC and GRIHA", "Daylight Analysis", "Climate-responsive Design"],
     {"Coursera": ["Sustainable Architecture and Green Buildings"], "NPTEL": ["Energy Efficient Buildings"]},
     [("Sustainable Architecture and Green Buildings", "Coursera", "2026-07-28", "Online")]),

    ("Kavitha Menon", "Biomedical Engineering", "Medical devices from idea to regulatory approval", 15, "Head of R&D, medical device startup",
     "Kavitha has taken three devices through CDSCO and CE approval. She teaches instrumentation, prototyping and regulation for engineers entering healthcare.",
     ["Medical Devices", "Biomedical Instrumentation", "ISO 13485", "Regulatory Affairs", "Signal Processing", "Prototyping"],
     {"NPTEL": ["Biomedical Instrumentation"], "Coursera": ["Medical Device Design and Regulation"], "Udemy": ["Build Your First Medical Device Prototype"]},
     [("Medical Device Design and Regulation", "Coursera", "2026-07-30", "Online")]),
]
ORIGINAL_COUNT = 24

LEARNERS = ["Aarav Patel", "Ishita Rao", "Rahul Nair", "Meghna Das", "Tanvi Joshi", "Vivek Gupta", "Sana Khan", "Harsh Vardhan",
            "Nandini Shetty", "Abhishek Tiwari", "Pallavi Kulkarni", "Dev Malhotra", "Riya Sen", "Kunal Bhatt", "Shreya Agarwal",
            "Mohit Yadav", "Ananya Krishnan", "Yash Thakur", "Deepika Pillai", "Arnav Chopra", "Simran Kaur", "Pranav Iyer",
            "Nikita Jain", "Sahil Mehra", "Bhavana Reddy", "Rohit Saini", "Aditi Bose", "Manoj Kumar", "Tara Fernandes", "Omkar Deshmukh"]

FIVE = [
    "{first} explains {topic} like a story. I finally understood concepts I had been avoiding for two years. The {course} assignments were tough but worth it.",
    "Best instructor I have had on {platform}. Every session of {course} had a real production example from {first}'s own work. Doubt sessions ran long and nobody minded.",
    "I switched careers after {course}. {first} reviewed my projects personally and pushed me to go deeper on {topic}.",
    "Clear, calm and extremely well prepared. {first} never rushed through {topic} and always checked that the slower learners were with us.",
    "Worth every rupee. The {course} capstone got me shortlisted at two companies. {first}'s feedback on my work was honest and very useful.",
    "Taught {topic} with real depth rather than slides. Recorded sessions were a lifesaver for my weekend-only schedule.",
    "I had tried two other courses on {topic} before this. {first} is the first person who made it click. Highly recommend {course}.",
]
FOUR = [
    "Very strong on {topic}. The only downside of {course} was the pace in the last two weeks, which felt rushed. Would still recommend {first} to anyone.",
    "{first} knows the material inside out. Some of the {course} labs had outdated setup steps, but the teaching itself was excellent.",
    "Great balance of theory and hands-on. I would have liked more interview-oriented practice on {topic}, but overall a solid course on {platform}.",
    "Patient with beginners and generous with time. A few more real-world case studies in {course} would have made it perfect.",
    "Explanations of {topic} were top notch. Assignments could use clearer grading rubrics. {first} replies to questions within a day.",
    "Good course, good mentor. {course} covers a lot; I had to spend extra weekends to keep up, but {first} was always available for doubts.",
]
THREE = [
    "Good content on {topic}, but {course} felt designed for people who already had some background. As a complete beginner I struggled in the first month.",
    "{first} is clearly an expert, though sessions sometimes went into tangents and we skipped parts of the {course} syllabus.",
    "Decent course. The live classes on {platform} were often late in the evening and a few got rescheduled. The recordings helped.",
    "Solid fundamentals, but I expected more on {topic} given the course description. Project feedback took over a week.",
]

WEIGHTS = [(0.62, 0.30, 0.08), (0.50, 0.38, 0.12), (0.40, 0.40, 0.20), (0.70, 0.25, 0.05), (0.33, 0.42, 0.25), (0.55, 0.35, 0.10)]


WOMEN = {"Kavya", "Priya", "Neha", "Shruti", "Divya", "Pooja", "Ritu", "Lakshmi", "Anjali", "Sneha", "Meenakshi", "Ayesha", "Nandita", "Kavitha"}


def avatar(name, idx=None):
    if idx is None:
        return f"https://api.dicebear.com/9.x/initials/svg?seed={name.replace(' ', '%20')}&backgroundColor=0071e3&fontWeight=600"
    gender = "women" if name.split()[0] in WOMEN else "men"
    return f"https://randomuser.me/api/portraits/{gender}/{(idx * 7 + 11) % 90}.jpg"


def build_seed():
    rng = random.Random(42)
    anchor = date(2026, 6, 1)
    instructors, stories = [], []
    for idx, (name, cat, headline, years, role, bio, skills, plats, batches) in enumerate(INSTRUCTORS):
        iid = str(uuid.uuid4())
        first = name.split()[0]
        instructors.append({
            "id": iid, "name": name, "headline": headline, "bio": bio, "years_experience": years,
            "industry_role": role, "category": cat, "domain": domain_for(cat), "skills": skills, "avatar": avatar(name, idx), "verified": True,
            "platforms": [{"name": p, "courses": c, "rating": round(rng.uniform(3.8, 4.9), 1)} for p, c in plats.items()],
            "batches": [{"course": c, "platform": p, "start_date": d, "mode": m} for c, p, d, m in batches],
        })
        w5, w4, w3 = WEIGHTS[idx % len(WEIGHTS)]
        used_templates, used_learners = set(), set()
        for _ in range(rng.randint(4, 6) if idx < ORIGINAL_COUNT else 4):
            platform = rng.choice(list(plats.keys()))
            course = rng.choice(plats[platform])
            rating = rng.choices([5, 4, 3], weights=[w5, w4, w3])[0]
            pool = [t for t in {5: FIVE, 4: FOUR, 3: THREE}[rating] if t not in used_templates] or FIVE + FOUR
            template = rng.choice(pool)
            used_templates.add(template)
            learner = rng.choice([n for n in LEARNERS if n not in used_learners])
            used_learners.add(learner)
            stories.append({
                "id": str(uuid.uuid4()), "instructor_id": iid, "learner_name": learner,
                "course": course, "platform": platform, "rating": rating,
                "date": (anchor - timedelta(days=rng.randint(5, 540))).isoformat(),
                "text": template.format(first=first, topic=rng.choice(skills), course=course, platform=platform),
            })
    return instructors, stories
