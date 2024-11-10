populateJobDropdown();
populateDepartmentDropdown();
async function signUp(event) {
  console.log("Signing up...");
  event.preventDefault();

  const password = document.getElementById("password").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const hireDate = new Date(
    document.getElementById("hireDate").value
  ).toISOString();
  const jobId = document.getElementById("jobId").value;
  const managerId = parseInt(document.getElementById("managerId").value);
  const departmentId = parseInt(document.getElementById("departmentId").value);
  const salary = parseFloat(document.getElementById("salary").value);
  const commissionPct = parseFloat(
    document.getElementById("commissionPct").value
  );

  const response = await fetch("http://localhost:8082/auth/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      phone_number: phoneNumber,
      hire_date: hireDate,
      job_id: jobId,
      manager_id: managerId,
      department_id: departmentId,
      salary: salary,
      commission_pct: commissionPct,
    }),
  });

  console.log(response);
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("userDetail", JSON.stringify(data.content));
    alert("Sign up successful!");
    window.location.href = "/studi-kasus/pages/login.html";
  } else {
    const data = await response.json();
    console.log(data.message);
    const messageElement = document.getElementById("message");
    messageElement.textContent = data.message;
    messageElement.style.color = "red";
  }
}

async function populateJobDropdown() {
  try {
    console.log("Fetching job data...");
    const response = await fetch("http://localhost:8082/job/all", {
      method: "GET",
      headers: {},
    });

    if (!response.ok) throw new Error("Failed to fetch jobs");

    const data = await response.json();
    console.log("Job data fetched:", data);

    const jobDropdown = document.getElementById("jobId");
    jobDropdown.innerHTML = '<option value="">Select a Job</option>'; // Reset options

    data.content.forEach((job) => {
      const option = document.createElement("option");
      option.value = job.job_id; // Replace `job_id` with the correct key if different
      option.textContent = job.job_title; // Replace `job_title` with the correct key if different
      jobDropdown.appendChild(option);
    });

    console.log("Job dropdown populated successfully.");
  } catch (error) {
    console.error("Error populating job dropdown:", error);
  }
}

async function populateDepartmentDropdown() {
  try {
    console.log("Fetching department data...");
    const response = await fetch("http://localhost:8082/dept/all", {
      method: "GET",
      headers: {},
    });

    if (!response.ok) throw new Error("Failed to fetch departments");

    const data = await response.json();
    console.log("Department data fetched:", data);

    const departmentDropdown = document.getElementById("departmentId");
    departmentDropdown.innerHTML =
      '<option value="">Select a Department</option>'; // Reset options

    data.content.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id; // Replace `id` with the correct key if different
      option.textContent = dept.department_name; // Replace `department_name` with the correct key if different
      departmentDropdown.appendChild(option);
    });

    console.log("Department dropdown populated successfully.");
  } catch (error) {
    console.error("Error populating department dropdown:", error);
  }
}
