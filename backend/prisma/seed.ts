import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
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

