const deptApiUrl = "http://localhost:8082/dept";
const deptTableBody = document.querySelector("#department-list");

// Utility Function to Validate Token
function validateToken() {
  const token = localStorage.getItem("authToken");
  if (!token || token.trim() === "") {
    console.log("Token is missing or empty. Redirecting to login.");
    window.location.href = "../pages/login.html";
    return false;
  }
  return token;
}

// Function to Fetch and Display All Departments
async function fetchAllDepartments() {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${deptApiUrl}/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch departments");

    const data = await response.json();
    populateDeptTable(data.content);

    if ($.fn.dataTable.isDataTable("#departmentTable")) {
      $("#departmentTable").DataTable().destroy();
    }
    $("#departmentTable").DataTable(); // Initialize DataTable
  } catch (error) {
    console.error(error);
    alert("Failed to fetch departments. Please try again.");
  }
}

// Function to Search for a Department by ID
async function searchDepartment() {
  const token = validateToken();
  if (!token) return;

  const departmentId = document.getElementById("search-item").value.trim();

  if (!departmentId) {
    alert("Please enter a department ID to search.");
    return;
  }

  try {
    const response = await fetch(`${deptApiUrl}/id/${departmentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error Response:", errorMessage);
      throw new Error("Department not found");
    }

    const data = await response.json();
    if (data) {
      populateDeptTable([data]); // Populate table with the searched department
    } else {
      deptTableBody.innerHTML =
        '<tr><td colspan="5">No department found with this ID</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    deptTableBody.innerHTML =
      '<tr><td colspan="5">Department not found</td></tr>';
  }
}

// Function to Populate the Table with Department Data
function populateDeptTable(departments) {
  deptTableBody.innerHTML = ""; // Clear previous table content

  if (!departments || departments.length === 0) {
    deptTableBody.innerHTML =
      '<tr><td colspan="5">No departments found</td></tr>';
    return;
  }

  departments.forEach((department) => {
    const row = `
        <tr>
          <td>${department.id || "-"}</td>
          <td>${department.department_name || "-"}</td>
          <td>${department.manager_id || "-"}</td>
          <td>${department.location_id || "-"}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editDepartment(${
              department.id
            })">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${
              department.id
            })">Delete</button>
          </td>
        </tr>`;
    deptTableBody.innerHTML += row;
  });
}

async function deleteDepartment(id) {
  const token = validateToken();
  if (!token) return;

  if (!confirm("Are you sure you want to delete this department?")) return;

  try {
    const response = await fetch(`${deptApiUrl}/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete department");

    fetchAllDepartments();
  } catch (error) {
    console.error(error);
    alert("Failed to delete department. Please try again.");
  }
}

// Function to Reset the Search and Fetch All Departments
function clearSearch() {
  document.getElementById("search-item").value = ""; // Clear search input
  fetchAllDepartments(); // Repopulate table with all departments
}

// Initial Load of All Departments
document.addEventListener("DOMContentLoaded", () => {
  fetchAllDepartments();
});

function showDepartmentModal(department) {
  const form = document.getElementById("departmentForm");
  const departmentIdInput = document.getElementById("department_id");

  if (department) {
    // Populate fields for editing
    console.log(form, form.first_name);
    form.department_name.value = department.department_name || "";
    form.manager_id.value = department.manager_id || "";
    form.location_id.value = department.location_id || "";
    departmentIdInput.value = department.id; // Hidden input for ID
  } else {
    // Clear fields for creating a new department
    form.reset();
    departmentIdInput.value = ""; // Ensure ID is cleared
  }
  document
    .getElementById("departmentForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = validateToken();
      if (!token) return;

      const formData = new FormData(e.target);
      const departmentData = Object.fromEntries(formData.entries());
      const id = document.getElementById("department_id").value; // Get ID for update

      try {
        const response = await fetch(
          deptApiUrl + (id ? `/update/${id}` : "/save"),
          {
            method: id ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(departmentData), // Convert data to JSON
          }
        );
        console.log(JSON.stringify(departmentData));
        console.log("API Response Status:", await JSON.stringify(response));

        if (!response.ok) {
          throw new Error(
            id ? "Failed to update department" : "Failed to save department"
          );
        }

        // Close the modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("departmentModal")
        );
        modal.hide();

        // Refresh the department list
        fetchAllDepartments();
      } catch (error) {
        console.error(error);
        alert("Failed to save department. Please try again.");
      }
    });

  // Fetch and Populate Department for Editing
  async function editDepartment(id) {
    const token = validateToken();
    if (!token) return;

    try {
      const response = await fetch(`${deptApiUrl}/id/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch department details");

      const department = await response.json();
      // alert(JSON.stringify(department.content));
      showDepartmentModal(department.content); // Pass department data to the modal
    } catch (error) {
      console.error("Error fetching department details:", error);
      alert("Failed to fetch department details. Please try again.");
    }
  }
  // Open the modal using Bootstrap's Modal class
  const modal = new bootstrap.Modal(document.getElementById("departmentModal"));
  modal.show();
}

// Create/Update Department
document
  .getElementById("departmentForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = validateToken();
    if (!token) return;

    const formData = new FormData(e.target);
    const departmentData = Object.fromEntries(formData.entries());
    const id = document.getElementById("department_id").value; // Get ID for update

    try {
      const response = await fetch(
        deptApiUrl + (id ? `/update/${id}` : "/save"),
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(), // Convert data to JSON
        }
      );

      console.log("API Response Status:", response.content);

      if (!response.ok) {
        throw new Error(
          id ? "Failed to update department" : "Failed to save department"
        );
      }

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("departmentModal")
      );
      modal.hide();
      alert("Department saved successfully");

      // Refresh the department list
      fetchAllDepartments();
    } catch (error) {
      console.error(error);
      alert("Failed to save department. Please try again.");
    }
  });

// Fetch and Populate Department for Editing
async function editDepartment(id) {
  const token = validateToken();
  if (!token) return;

  try {
    const response = await fetch(`${deptApiUrl}/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch department details");

    const department = await response.json();
    // alert(JSON.stringify(department.content));
    showDepartmentModal(department.content[0]); // Pass department data to the modal
  } catch (error) {
    console.error("Error fetching department details:", error);
    alert("Failed to fetch department details. Please try again.");
  }
}
