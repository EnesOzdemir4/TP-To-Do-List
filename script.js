// Récupération des éléments du DOM
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const todoSection = document.getElementById("todo-section");
    const userNameSpan = document.getElementById("user-name");
    const logoutBtn = document.getElementById("logout");
    const container = document.querySelector(".container");
    const taskContainer = document.getElementById("task-container");

    const showTaskFormBtn = document.getElementById("show-task-form");
    const taskPopup = document.getElementById("task-popup");
    const closePopupBtn = document.getElementById("close-popup");
    const taskForm = document.getElementById("task-form");

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Vérification de l'utilisateur connecté et affichage de la section appropriée
    if (currentUser) {
        afficherToDoList(currentUser);
    } else {
        loginSection.style.display = "block";
        todoSection.style.display = "none";
        if (taskContainer) {
            taskContainer.style.display = "none";
        }
    }

    // Gestion de l'affichage du formulaire de tâche
    showTaskFormBtn.addEventListener("click", () => {
        taskPopup.style.display = "flex";
    });

    closePopupBtn.addEventListener("click", () => {
        taskPopup.style.display = "none";
    });

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("task-title").value;
        const comment = document.getElementById("task-comment").value;
        const status = document.getElementById("task-status").value;
        const deadline = document.getElementById("task-deadline").value;

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push({ title, comment, status, deadline, validated: false });
        localStorage.setItem("tasks", JSON.stringify(tasks));

        taskForm.reset();
        taskPopup.style.display = "none";
        afficherTaches();
    });

    // Gestion de l'affichage des formulaires de connexion et d'inscription
    document.getElementById("show-register").addEventListener("click", (e) => {
        e.preventDefault();
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    });

    document.getElementById("show-login").addEventListener("click", (e) => {
        e.preventDefault();
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // Gestion de l'inscription
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(user => user.email === email)) {
            alert("Cet email est déjà utilisé !");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("users", JSON.stringify(users));

        alert("Inscription réussie !");
        registerForm.reset();
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // Gestion de la connexion
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const validUser = users.find(user => user.email === email && user.password === password);

        if (validUser) {
            localStorage.setItem("currentUser", JSON.stringify(validUser));
            afficherToDoList(validUser);
        } else {
            alert("Identifiants incorrects !");
        }
    });

    // Gestion de la déconnexion
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        location.reload();
    });

    //  Fonction pour afficher la liste des tâches
    function afficherToDoList(user) {
        if (container) container.style.display = "none";
        todoSection.style.display = "block";
        if (taskContainer) {
            taskContainer.style.display = "block";
        }
        userNameSpan.textContent = user.name;
        afficherTaches();
    }

    // Fonction pour afficher les tâches
    function afficherTaches(searchText = "") {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        taskContainer.innerHTML = "";
    
        const titleElement = document.createElement("h3");
        titleElement.textContent = "Liste des tâches";
        taskContainer.appendChild(titleElement);
    
        // Filtrage des tâches en fonction du texte recherché
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchText) ||
            task.comment.toLowerCase().includes(searchText)
        );
    
        // Si aucune tâche ne correspond à la recherche
        if (filteredTasks.length === 0) {
            const noTaskElement = document.createElement("p");
            noTaskElement.textContent = "Aucune tâche trouvée.";
            taskContainer.appendChild(noTaskElement);
            return;
        }
        
        // Affichage des tâches Titres, commentaires, status et deadline
        filteredTasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");
    
            if (task.validated) {
                taskElement.classList.add("validated-task");
            }
    
            taskElement.innerHTML = `
                <h4>${task.title}</h4> 
                <p>${task.comment}</p>
                <p><strong>Status :</strong> ${task.status}</p>
                <p><strong>Deadline :</strong> ${task.deadline}</p>
                <div class="task-footer">
                    <div class="buttons">
                        ${!task.validated ? `<button class="validate-task" data-index="${index}">✔</button>` : ""}
                        ${!task.validated ? `<button class="delete-task" data-index="${index}">×</button>` : ""}
                    </div>
                </div>
            `;
    
            if (task.validated) {
                taskElement.style.backgroundColor = "#212121";
                taskElement.style.textDecoration = "line-through";
                taskElement.style.textDecorationColor = "white";
            }
        
            // Ajouter chaque nouvelle tâche juste après le titre
            taskContainer.insertBefore(taskElement, taskContainer.children[1]);
        });


        // Fonction pour valider une tâche

        function validerTache(index) {
            const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            tasks[index].validated = true; 
            localStorage.setItem("tasks", JSON.stringify(tasks));
            afficherTaches(); 
        }
    
        for (const button of document.querySelectorAll(".validate-task")) {
            button.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                validerTache(index);
            });
        }

        // Fonction pour supprimer une tâche
        function supprimerTache(title, searchText) {
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
            tasks = tasks.filter(task => task.title !== title); // Supprime la tâche par son titre
            localStorage.setItem("tasks", JSON.stringify(tasks));
        
            // Réappliquer le filtre après suppression
            afficherTaches(searchText);
        }

        for (const button of document.querySelectorAll(".delete-task")) {
            button.addEventListener("click", (e) => {
                const title = e.target.closest(".task").querySelector("h4").textContent;
                supprimerTache(title, searchText);
            });
        }
    }
    
        // Gestion de la recherche de tâches
        document.getElementById("search-task").addEventListener("input", (e) => {
        console.log("Recherche déclenchée avec : ", e.target.value);
        const searchText = e.target.value.toLowerCase();
        afficherTaches(searchText);
        });      
    });
