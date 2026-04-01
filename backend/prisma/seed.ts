import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 Seeding database...");

  // Define lessons with quizzes
  const lessons = [
    {
      title: "What is money?",
      content:
        "Money is something we use to buy things we need and things we want. It helps us exchange value.",
      category: "Financial Basics",
      ageGroup: "8-12",
      quizzes: [
        {
          question: "What do we use money for?",
          optionA: "To sleep",
          optionB: "To buy things",
          optionC: "To run faster",
          optionD: "To color books",
          correctAnswer: "B",
        },
      ],
    },
    {
      title: "Saving money",
      content:
        "Saving means keeping some money now so you can use it later for an important goal.",
      category: "Savings",
      ageGroup: "8-12",
      quizzes: [
        {
          question: "Why do we save money?",
          optionA: "For future goals",
          optionB: "To lose it",
          optionC: "To avoid school",
          optionD: "To throw away",
          correctAnswer: "A",
        },
      ],
    },
    {
      title: "Needs vs wants",
      content:
        "A need is something important like food and school supplies. A want is something nice to have, like extra toys.",
      category: "Budgeting",
      ageGroup: "8-12",
      quizzes: [
        {
          question: "Which is a need?",
          optionA: "New video game",
          optionB: "School notebook",
          optionC: "Extra candy",
          optionD: "Fancy shoes",
          correctAnswer: "B",
        },
      ],
    },
    {
      title: "Earning money",
      content:
        "Earning means getting money by doing work, helping with tasks, or running a small project. We can save part of what we earn.",
      category: "Financial Basics",
      ageGroup: "8-12",
      quizzes: [
        {
          question: "What does it mean to earn money?",
          optionA: "To spend all money quickly",
          optionB: "To get money for work done",
          optionC: "To hide money forever",
          optionD: "To borrow from everyone",
          correctAnswer: "B",
        },
      ],
    },
    {
      title: "Planning a simple budget",
      content:
        "A budget is a plan for money. It helps us decide how much to spend now, how much to save, and how much to share.",
      category: "Budgeting",
      ageGroup: "8-12",
      quizzes: [
        {
          question: "What is a budget?",
          optionA: "A plan for using money",
          optionB: "A type of toy",
          optionC: "Only a bank account",
          optionD: "A way to avoid saving",
          correctAnswer: "A",
        },
      ],
    },
  ];

  for (const lesson of lessons) {
    const existingLesson = await prisma.lesson.findFirst({
      where: { title: lesson.title },
    });

    const created = existingLesson
      ? await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            content: lesson.content,
            category: lesson.category,
            ageGroup: lesson.ageGroup,
          },
        })
      : await prisma.lesson.create({
          data: {
            title: lesson.title,
            content: lesson.content,
            category: lesson.category,
            ageGroup: lesson.ageGroup,
          },
        });

    for (const quiz of lesson.quizzes) {
      const exists = await prisma.quiz.findFirst({
        where: { lessonId: created.id, question: quiz.question },
      });
      if (!exists) {
        await prisma.quiz.create({
          data: { ...quiz, lessonId: created.id },
        });
      }
    }
  }

  // Create test users for demo
  console.log("Creating test users...");
  
  // Create test child
  let testChild = await prisma.user.findUnique({
    where: { email: "emma@example.com" },
  });
  
  if (!testChild) {
    testChild = await prisma.user.create({
      data: {
        fullName: "Emma Johnson",
        email: "emma@example.com",
        password: await hashPassword("password123"),
        role: "child",
      },
    });
    console.log(`✓ Created test child: ${testChild.email}`);
  }

  // Create test parent
  let testParent = await prisma.user.findUnique({
    where: { email: "parent@example.com" },
  });
  
  if (!testParent) {
    testParent = await prisma.user.create({
      data: {
        fullName: "Sarah Johnson",
        email: "parent@example.com",
        password: await hashPassword("password123"),
        role: "parent",
      },
    });
    console.log(`✓ Created test parent: ${testParent.email}`);
  }

  // Create test facilitator
  let testFacilitator = await prisma.user.findUnique({
    where: { email: "teacher@example.com" },
  });
  
  if (!testFacilitator) {
    testFacilitator = await prisma.user.create({
      data: {
        fullName: "Ms. Peterson",
        email: "teacher@example.com",
        password: await hashPassword("password123"),
        role: "facilitator",
      },
    });
    console.log(`✓ Created test facilitator: ${testFacilitator.email}`);
  }

  // Link child to parent
  const existingLink = await prisma.parentChildLink.findUnique({
    where: {
      parentId_childId: {
        parentId: testParent.id,
        childId: testChild.id,
      },
    },
  });

  if (!existingLink) {
    await prisma.parentChildLink.create({
      data: {
        parentId: testParent.id,
        childId: testChild.id,
      },
    });
    console.log(`✓ Linked child ${testChild.fullName} to parent ${testParent.fullName}`);
  }

  // Link child to facilitator
  const facilitatorLink = await prisma.parentChildLink.findUnique({
    where: {
      parentId_childId: {
        parentId: testFacilitator.id,
        childId: testChild.id,
      },
    },
  });

  if (!facilitatorLink) {
    await prisma.parentChildLink.create({
      data: {
        parentId: testFacilitator.id,
        childId: testChild.id,
      },
    });
    console.log(`✓ Linked child ${testChild.fullName} to facilitator ${testFacilitator.fullName}`);
  }

  console.log("\n📝 Test Credentials:");
  console.log("Child:       emma@example.com / password123");
  console.log("Parent:      parent@example.com / password123");
  console.log("Facilitator: teacher@example.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

