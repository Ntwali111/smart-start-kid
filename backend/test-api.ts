import { prisma } from "./src/lib/prisma";
import { hashPassword } from "./src/lib/auth";

async function testAPI() {
  try {
    // Create a test child account
    const childCreate = await prisma.user.create({
      data: {
        fullName: "Test Child",
        email: "testchild@example.com",
        password: await hashPassword("password123"),
        role: "child",
      },
    });
    console.log("✅ Created child user:", childCreate.id);

    // Create a test parent account
    const parentCreate = await prisma.user.create({
      data: {
        fullName: "Test Parent",
        email: "testparent@example.com",
        password: await hashPassword("password123"),
        role: "parent",
      },
    });
    console.log("✅ Created parent user:", parentCreate.id);

    // Link child to parent
    const link = await prisma.parentChildLink.create({
      data: {
        parentId: parentCreate.id,
        childId: childCreate.id,
      },
    });
    console.log("✅ Linked child to parent:", link.id);

    // Test getting parent dashboard
    const links = await prisma.parentChildLink.findMany({
      where: { parentId: parentCreate.id },
      include: {
        child: {
          select: {
            id: true,
            fullName: true,
            lessonProgress: {
              where: { completed: true },
              select: { score: true, lesson: { select: { title: true } } },
            },
            savingsGoals: true,
          },
        },
      },
    });
    console.log("✅ Parent dashboard data:", JSON.stringify(links, null, 2));

    console.log(
      "\n📋 You can now login with:\nEmail: testparent@example.com\nPassword: password123"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
