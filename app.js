/* =====================================================
   KWANJULA PLANNER
   Version 1
   No database required.
   Data is stored in the browser.
===================================================== */


/* =====================================================
   DATA
===================================================== */

let planner = JSON.parse(
    localStorage.getItem("kwanjulaPlanner")
) || null;


/* =====================================================
   STARTUP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    if (planner) {

        showScreen("dashboardScreen");

        loadPlanner();

    } else {

        showScreen("setupScreen");

    }

});


/* =====================================================
   SAVE DATA
===================================================== */

function savePlanner() {

    localStorage.setItem(
        "kwanjulaPlanner",
        JSON.stringify(planner)
    );

}


/* =====================================================
   SCREEN NAVIGATION
===================================================== */

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {

        screen.classList.add("hidden");

    });

    document
        .getElementById(screenId)
        .classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   SETUP
===================================================== */

function showSetupForm() {

    showScreen("setupForm");

}


function createPlanner() {

    const ownerName =
        document.getElementById("ownerName").value.trim();

    const eventDate =
        document.getElementById("eventDate").value;

    const venue =
        document.getElementById("venue").value.trim();

    const mainContact =
        document.getElementById("mainContact").value.trim();

    const mainPhone =
        document.getElementById("mainPhone").value.trim();

    const plannedBudget =
        Number(
            document.getElementById("plannedBudget").value
        ) || 0;


    if (!ownerName || !eventDate) {

        alert(
            "Please enter your name and Kwanjula date."
        );

        return;

    }


    planner = {

        details: {

            ownerName,
            eventDate,
            venue,
            mainContact,
            mainPhone,
            plannedBudget

        },

        tasks: [],

        budget: [],

        shopping: [],

        requirements: [],

        contacts: [],

        programme: []

    };


    savePlanner();

    loadPlanner();

    showScreen("dashboardScreen");

}


/* =====================================================
   LOAD PLANNER
===================================================== */

function loadPlanner() {

    if (!planner) return;


    updateDashboard();

    renderTasks();

    renderBudget();

    renderShopping();

    renderRequirements();

    renderContacts();

    renderProgramme();

    loadDetailsForm();

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const details = planner.details;


    document.getElementById(
        "dashboardTitle"
    ).textContent =
        details.ownerName + "'s Kwanjula";


    document.getElementById(
        "dashboardVenue"
    ).textContent =
        details.venue || "Venue not added";


    updateCountdown();


    /* Budget */

    const actual =
        planner.budget.reduce(
            (total, item) =>
                total + Number(item.actual || 0),
            0
        );


    document.getElementById(
        "budgetStat"
    ).textContent =
        formatUGX(actual);


    /* Tasks */

    const completed =
        planner.tasks.filter(
            task => task.completed
        ).length;


    document.getElementById(
        "tasksStat"
    ).textContent =
        `${completed} / ${planner.tasks.length}`;


    /* Shopping */

    const bought =
        planner.shopping.filter(
            item => item.bought
        ).length;


    document.getElementById(
        "shoppingStat"
    ).textContent =
        `${bought} / ${planner.shopping.length}`;


    /* Requirements */

    document.getElementById(
        "requirementsStat"
    ).textContent =
        planner.requirements.length;


    runForgettingCheck(false);

}


/* =====================================================
   COUNTDOWN
===================================================== */

function updateCountdown() {

    const eventDate =
        new Date(planner.details.eventDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    eventDate.setHours(0, 0, 0, 0);


    const difference =
        eventDate - today;


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const element =
        document.getElementById("daysLeft");


    if (days > 0) {

        element.textContent = days;

    } else if (days === 0) {

        element.textContent = "Today";

    } else {

        element.textContent = "Past";

    }

}


/* =====================================================
   FORMAT UGX
===================================================== */

function formatUGX(number) {

    return "UGX " +
        Number(number || 0)
        .toLocaleString("en-UG");

}


/* =====================================================
   TASKS
===================================================== */

function addTask() {

    const name =
        document.getElementById("taskInput")
        .value.trim();

    const date =
        document.getElementById("taskDate")
        .value;

    const priority =
        document.getElementById("taskPriority")
        .value;


    if (!name) {

        alert("Enter a task.");

        return;

    }


    planner.tasks.push({

        id: Date.now(),

        name,

        date,

        priority,

        completed: false

    });


    savePlanner();

    document.getElementById(
        "taskInput"
    ).value = "";

    document.getElementById(
        "taskDate"
    ).value = "";


    renderTasks();

    updateDashboard();

}


function toggleTask(id) {

    const task =
        planner.tasks.find(
            item => item.id === id
        );


    if (task) {

        task.completed =
            !task.completed;

    }


    savePlanner();

    renderTasks();

    updateDashboard();

}


function deleteTask(id) {

    planner.tasks =
        planner.tasks.filter(
            task => task.id !== id
        );


    savePlanner();

    renderTasks();

    updateDashboard();

}


function renderTasks() {

    const container =
        document.getElementById("taskList");


    if (!planner.tasks.length) {

        container.innerHTML = emptyMessage(
            "No tasks yet. Add your first task above."
        );

        return;

    }


    container.innerHTML =
        planner.tasks.map(task => {

            const date =
                task.date
                ? formatDate(task.date)
                : "No deadline";


            return `

                <div class="list-item
                    ${task.completed ? "completed" : ""}">

                    <div class="list-main">

                        <strong>
                            ${escapeHTML(task.name)}
                        </strong>

                        <small>
                            📅 ${date}
                        </small>

                        <br>

                        <span class="priority
                            ${task.priority.toLowerCase()}">

                            ${task.priority}

                        </span>

                    </div>

                    <div class="list-actions">

                        <button
                            class="small-btn"
                            onclick="toggleTask(${task.id})">

                            ${task.completed
                                ? "↩️"
                                : "✓"}

                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteTask(${task.id})">

                            🗑️

                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/* =====================================================
   BUDGET
===================================================== */

function addBudgetItem() {

    const name =
        document.getElementById("budgetName")
        .value.trim();

    const estimated =
        Number(
            document.getElementById(
                "budgetEstimated"
            ).value
        ) || 0;


    const actual =
        Number(
            document.getElementById(
                "budgetActualInput"
            ).value
        ) || 0;


    if (!name) {

        alert("Enter a budget category.");

        return;

    }


    planner.budget.push({

        id: Date.now(),

        name,

        estimated,

        actual

    });


    savePlanner();

    document.getElementById(
        "budgetName"
    ).value = "";

    document.getElementById(
        "budgetEstimated"
    ).value = "";

    document.getElementById(
        "budgetActualInput"
    ).value = "";


    renderBudget();

    updateDashboard();

}


function deleteBudgetItem(id) {

    planner.budget =
        planner.budget.filter(
            item => item.id !== id
        );


    savePlanner();

    renderBudget();

    updateDashboard();

}


function renderBudget() {

    const container =
        document.getElementById("budgetList");


    let planned = 0;

    let actual = 0;


    planner.budget.forEach(item => {

        planned += Number(item.estimated || 0);

        actual += Number(item.actual || 0);

    });


    const budgetLimit =
        Number(
            planner.details.plannedBudget || 0
        );


    document.getElementById(
        "budgetPlanned"
    ).textContent =
        formatUGX(planned);


    document.getElementById(
        "budgetActual"
    ).textContent =
        formatUGX(actual);


    document.getElementById(
        "budgetRemaining"
    ).textContent =
        formatUGX(
            budgetLimit - actual
        );


    if (!planner.budget.length) {

        container.innerHTML = emptyMessage(
            "No budget categories yet."
        );

        return;

    }


    container.innerHTML =
        planner.budget.map(item => `

            <div class="list-item">

                <div class="list-main">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <small>
                        Planned:
                        ${formatUGX(item.estimated)}
                    </small>

                    <br>

                    <small>
                        Actual:
                        ${formatUGX(item.actual)}
                    </small>

                </div>

                <button
                    class="small-btn delete-btn"
                    onclick="deleteBudgetItem(${item.id})">

                    🗑️

                </button>

            </div>

        `).join("");

}


/* =====================================================
   SHOPPING
===================================================== */

function addShoppingItem() {

    const name =
        document.getElementById(
            "shoppingName"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById(
                "shoppingQuantity"
            ).value
        ) || 1;


    const cost =
        Number(
            document.getElementById(
                "shoppingCost"
            ).value
        ) || 0;


    if (!name) {

        alert("Enter a shopping item.");

        return;

    }


    planner.shopping.push({

        id: Date.now(),

        name,

        quantity,

        cost,

        bought: false

    });


    savePlanner();


    document.getElementById(
        "shoppingName"
    ).value = "";

    document.getElementById(
        "shoppingQuantity"
    ).value = "";

    document.getElementById(
        "shoppingCost"
    ).value = "";


    renderShopping();

    updateDashboard();

}


function toggleShopping(id) {

    const item =
        planner.shopping.find(
            item => item.id === id
        );


    if (item) {

        item.bought =
            !item.bought;

    }


    savePlanner();

    renderShopping();

    updateDashboard();

}


function deleteShopping(id) {

    planner.shopping =
        planner.shopping.filter(
            item => item.id !== id
        );


    savePlanner();

    renderShopping();

    updateDashboard();

}


function renderShopping() {

    const container =
        document.getElementById(
            "shoppingList"
        );


    if (!planner.shopping.length) {

        container.innerHTML = emptyMessage(
            "Your shopping list is empty."
        );

        return;

    }


    container.innerHTML =
        planner.shopping.map(item => `

            <div class="list-item
                ${item.bought ? "completed" : ""}">

                <div class="list-main">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <small>
                        Quantity: ${item.quantity}
                        · ${formatUGX(item.cost)}
                    </small>

                </div>

                <div class="list-actions">

                    <button
                        class="small-btn"
                        onclick="toggleShopping(${item.id})">

                        ${item.bought ? "↩️" : "✓"}

                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="deleteShopping(${item.id})">

                        🗑️

                    </button>

                </div>

            </div>

        `).join("");

}


/* =====================================================
   FAMILY REQUIREMENTS
===================================================== */

function addRequirement() {

    const name =
        document.getElementById(
            "requirementName"
        ).value.trim();


    const notes =
        document.getElementById(
            "requirementNotes"
        ).value.trim();


    if (!name) {

        alert("Enter a requirement.");

        return;

    }


    planner.requirements.push({

        id: Date.now(),

        name,

        notes,

        completed: false

    });


    savePlanner();


    document.getElementById(
        "requirementName"
    ).value = "";

    document.getElementById(
        "requirementNotes"
    ).value = "";


    renderRequirements();

    updateDashboard();

}


function toggleRequirement(id) {

    const item =
        planner.requirements.find(
            item => item.id === id
        );


    if (item) {

        item.completed =
            !item.completed;

    }


    savePlanner();

    renderRequirements();

    updateDashboard();

}


function deleteRequirement(id) {

    planner.requirements =
        planner.requirements.filter(
            item => item.id !== id
        );


    savePlanner();

    renderRequirements();

    updateDashboard();

}


function renderRequirements() {

    const container =
        document.getElementById(
            "requirementsList"
        );


    if (!planner.requirements.length) {

        container.innerHTML = emptyMessage(
            "No family requirements added yet."
        );

        return;

    }


    container.innerHTML =
        planner.requirements.map(item => `

            <div class="requirement-card
                ${item.completed ? "completed" : ""}">

                <div class="list-item"
                     style="border:none;padding:0;margin:0">

                    <div class="list-main">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                item.notes ||
                                "No notes"
                            )}
                        </small>

                    </div>

                    <div class="list-actions">

                        <button
                            class="small-btn"
                            onclick="toggleRequirement(${item.id})">

                            ${item.completed
                                ? "↩️"
                                : "✓"}

                        </button>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteRequirement(${item.id})">

                            🗑️

                        </button>

                    </div>

                </div>

            </div>

        `).join("");

}


/* =====================================================
   CONTACTS
===================================================== */

function addContact() {

    const name =
        document.getElementById(
            "contactName"
        ).value.trim();


    const role =
        document.getElementById(
            "contactRole"
        ).value.trim();


    const phone =
        document.getElementById(
            "contactPhone"
        ).value.trim();


    if (!name || !phone) {

        alert("Enter at least a name and phone number.");

        return;

    }


    planner.contacts.push({

        id: Date.now(),

        name,

        role,

        phone

    });


    savePlanner();


    document.getElementById(
        "contactName"
    ).value = "";

    document.getElementById(
        "contactRole"
    ).value = "";

    document.getElementById(
        "contactPhone"
    ).value = "";


    renderContacts();

    updateDashboard();

}


function deleteContact(id) {

    planner.contacts =
        planner.contacts.filter(
            item => item.id !== id
        );


    savePlanner();

    renderContacts();

    updateDashboard();

}


function renderContacts() {

    const container =
        document.getElementById(
            "contactsList"
        );


    if (!planner.contacts.length) {

        container.innerHTML = emptyMessage(
            "No contacts added yet."
        );

        return;

    }


    container.innerHTML =
        planner.contacts.map(item => `

            <div class="list-item">

                <div class="list-main">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <small>
                        ${escapeHTML(
                            item.role ||
                            "Contact"
                        )}
                    </small>

                    <br>

                    <small>
                        📞 ${escapeHTML(item.phone)}
                    </small>

                </div>

                <button
                    class="small-btn delete-btn"
                    onclick="deleteContact(${item.id})">

                    🗑️

                </button>

            </div>

        `).join("");

}


/* =====================================================
   PROGRAMME
===================================================== */

function addProgrammeItem() {

    const time =
        document.getElementById(
            "programmeTime"
        ).value;


    const activity =
        document.getElementById(
            "programmeActivity"
        ).value.trim();


    const pers
