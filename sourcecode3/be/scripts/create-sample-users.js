/**
 * Script tạo tài khoản admin, manager và user mẫu
 * Sử dụng: node scripts/create-initial-users.js
 */

const { User } = require("../src/models");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

async function createInitialUsers() {
  try {
    console.log("🚀 Bắt đầu tạo tài khoản...");

    const users = [
      // Manager
      {
        id: uuidv4(),
        email: "manager@example.com",
        password: "Manager@123",
        firstName: "Manager",
        lastName: "Tran",
        role: "manager",
      },
      // Customers thực tế
      {
        id: uuidv4(),
        email: "nguyen.hoang@example.com",
        password: "User1234",
        firstName: "Hoang",
        lastName: "Nguyen",
        role: "customer",
      },
      {
        id: uuidv4(),
        email: "le.thi@example.com",
        password: "User1234",
        firstName: "Thi",
        lastName: "Le",
        role: "customer",
      },
      {
        id: uuidv4(),
        email: "pham.tuan@example.com",
        password: "User1234",
        firstName: "Tuan",
        lastName: "Pham",
        role: "customer",
      },
    ];

    for (const u of users) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (existing) {
        console.log(`⚠️ Tài khoản ${u.email} đã tồn tại, bỏ qua.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);

      await User.create({
        ...u,
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true,
      });

      console.log(`✅ Tạo tài khoản thành công: ${u.email} (${u.role})`);
    }

    console.log("🎉 Hoàn tất tạo dữ liệu!");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    process.exit(0);
  }
}

createInitialUsers();
