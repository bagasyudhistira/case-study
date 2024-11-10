const apiUrl = "http://localhost:8082/emp";
const tableBody = document.querySelector("#employee-list");

let employeeTable; // Reference for the DataTable instance

// Utility Function to Validate Token
function validateToken() {
  const token = localStorage.getItem("authToken");
  if (!token || token.trim() === "") {
    window.location.href = "../pages/login.html"; // Redirect to login if no token
    return false;
  }
  return token;
}

// Fetch All Employees and Initialize DataTable
async function fetchAllEmployees() {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:8082/emp-dept-job/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch employees");

    const data = await response.json();
    populateTable(data.content);

    if ($.fn.dataTable.isDataTable("#employeeTable")) {
      employeeTable.destroy();
    }
    employeeTable = $("#employeeTable").DataTable();
  } catch (error) {
    console.error(error);
    alert("Failed to fetch employees. Please try again.");
  }
}

// Populate Table with Employee Data
function populateTable(employees) {
  tableBody.innerHTML = "";

  if (!employees || employees.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="11">No employees found</td></tr>';
    return;
  }

  employees.forEach((employee) => {
    const row = `
      <tr>
        <td>${employee.id || "-"}</td>
        <td>${employee.first_name || "-"}  ${employee.last_name || "-"}</td>
        <td>${employee.email || "-"}</td>
        <td>${employee.phone_number || "-"}</td>
        <td>${employee.hire_date || "-"}</td>
        <td>${employee.job_title || "-"}</td>
        <td>${employee.salary || "-"}</td>
        <td>${employee.commission_pct || "-"}</td>
        <td>${employee.manager_id || "-"}</td>
        <td>${employee.department_name || "-"}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editEmployee(${
            employee.id
          })">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${
            employee.id
          })">Delete</button>
        </td>
      </tr>`;
    tableBody.innerHTML += row;
  });
}

// Show modal for creating/updating an employee
function showEmployeeModal(employee) {
  // Populate dropdowns

  const form = document.getElementById("employeeForm");
  const employeeIdInput = document.getElementById("employeeId");

  if (employee) {
    populateJobDropdown(employee);
    populateDepartmentDropdown(employee);
    form.first_name.value = employee.first_name || "";
    form.last_name.value = employee.last_name || "";

    form.email.value = employee.email || "";
    form.password.value = employee.password || "";
    form.phone_number.value = employee.phone_number || "";
    form.hire_date.value = employee.hire_date
      ? employee.hire_date.split("T")[0]
      : "";
    form.job_id.value = employee.job_id || "";
    form.salary.value = employee.salary || "";
    form.commission_pct.value = employee.commission_pct || "";
    form.manager_id.value = employee.manager_id || "";
    form.department_id.value = employee.department_id || "";
    employeeIdInput.value = employee.id;
  } else {
    form.reset();
    populateJobDropdown();
    populateDepartmentDropdown();
    employeeIdInput.value = "";
  }

  const modal = new bootstrap.Modal(document.getElementById("employeeModal"));
  modal.show();
}

document
  .getElementById("employeeForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = validateToken();
    if (!token) return;

    const formData = new FormData(e.target);
    const employeeData = Object.fromEntries(formData.entries());
    const id = document.getElementById("employeeId").value; // Get ID for update

    try {
      const response = await fetch(apiUrl + (id ? `/update/${id}` : "/save"), {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData), // Convert data to JSON
      });

      console.log("API Response Status:", response.content);

      if (!response.ok) {
        throw new Error(
          id ? "Failed to update employee" : "Failed to save employee"
        );
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("employeeModal")
      );
      modal.hide();

      alert("Employee saved successfully!");

      // Refresh the employee list
      await fetchAllEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to save employee. Please try again.");
    }
  });

// Fetch and Populate Employee for Editing
async function editEmployee(id) {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${apiUrl}/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch employee details");

    const employee = await response.json();
    // alert(JSON.stringify(employee.content));
    showEmployeeModal(employee.content[0]); // Pass employee data to the modal
  } catch (error) {
    console.error("Error fetching employee details:", error);
    alert("Failed to fetch employee details. Please try again.");
  }
}

// Delete Employee
async function deleteEmployee(id) {
  const token = validateToken();
  if (!token) return;

  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    const response = await fetch(`${apiUrl}/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete employee");
    } else {
      alert("Employee deleted successfully!");
    }

    await fetchAllEmployees();
  } catch (error) {
    console.error(error);
    alert("Failed to delete employee. Please try again.");
  }
}

// Initial Load
document.addEventListener("DOMContentLoaded", fetchAllEmployees);

// Attach logout function to logout button
document.getElementById("logoutButton").addEventListener("click", logout);

// Fetch all jobs and populate the dropdown
async function populateJobDropdown(employee) {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch("http://localhost:8082/job/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch jobs");

    const data = await response.json();
    const jobDropdown = document.getElementById("jobId");
    jobDropdown.innerHTML = '<option value="">Select a Job</option>'; // Reset options

    data.content.forEach((job) => {
      const option = document.createElement("option");
      if (employee != null && job.job_id === employee.job_id) {
        option.selected = true;
      }
      option.value = job.job_id; // Assuming `id` is the unique identifier
      option.textContent = job.job_title; // Replace with the appropriate field for job title
      jobDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}

// Fetch all departments and populate the dropdown
async function populateDepartmentDropdown(employee) {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch("http://localhost:8082/dept/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch departments");

    const data = await response.json();
    const departmentDropdown = document.getElementById("departmentId");
    departmentDropdown.innerHTML =
      '<option value="">Select a Department</option>'; // Reset options

    data.content.forEach((dept) => {
      const option = document.createElement("option");
      if (employee != null && dept.id === employee.department_id) {
        option.selected = true;
      }
      option.value = dept.id; // Assuming `id` is the unique identifier
      option.textContent = dept.department_name; // Replace with the appropriate field for department name
      departmentDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}
