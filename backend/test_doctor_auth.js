const BASE_URL = "http://localhost:3000/api";

async function testDoctorAuth() {
  const doctor = {
    name: "Test Doctor",
    phoneNumber: "9999999999",
    email: "testdoc@example.com",
    specialisation: "Cardiology",
    password: "password123",
  };

  try {
    // 1. Signup
    console.log("Testing Signup...");
    let signupRes = await fetch(`${BASE_URL}/doctor-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    if (signupRes.status === 409) {
      console.log("Doctor already exists (Status 409), proceeding to login...");
    } else if (!signupRes.ok) {
      const err = await signupRes.text();
      throw new Error(`Signup Failed: ${signupRes.status} ${err}`);
    } else {
      const data = await signupRes.json();
      console.log("Signup Success:", data);
    }

    // 2. Login
    console.log("Testing Login...");
    const loginRes = await fetch(`${BASE_URL}/doctor-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: doctor.phoneNumber,
        password: doctor.password,
      }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.text();
      throw new Error(`Login Failed: ${loginRes.status} ${err}`);
    }

    const loginData = await loginRes.json();
    console.log("Login Success:", loginData);

    if (
      loginData.doctor &&
      loginData.doctor.phone == doctor.phoneNumber &&
      loginData.doctor.id >= 10001
    ) {
      console.log(
        "TEST PASSED: Doctor login returned correct data with correct ID range.",
      );
    } else {
      console.log(
        "TEST FAILED: Doctor data mismatch or ID not in expected range (>= 10001). Received:",
        loginData.doctor,
      );
    }
  } catch (error) {
    console.error("TEST FAILED:", error.message);
  }
}

testDoctorAuth();
