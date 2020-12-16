let tasks;
if (localStorage.getItem("tasks") == null) {
  tasks = {
    active: [],
    completed: [],
    activeSequence: 0,
  };
  localStorage.setItem("tasks", JSON.stringify(tasks));
} else {
  tasks = JSON.parse(localStorage.getItem("tasks"));
}

Object.defineProperty(tasks, "all", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: [...tasks.completed, ...tasks.active],
});

window.addEventListener("load", () => {
  const form = document.getElementById("form");
  const textTodo = document.getElementById("text-todo");
  const label = textTodo.previousElementSibling;
  const options = document.getElementById("options");
  const optionButtons = [...document.querySelectorAll(".options__button")];
  const clearButton = document.getElementById("clear-button");
  const todoList = document.getElementById("list");

  // Objeto todo que almacenará las listas con las tareas pendientes y completadas.
  // Función que genera una tarea pendiente y la agrega al array (active) tareas pendientes
  createTask = (taskName) => {
    const task = {
      id: tasks.activeSequence,
      taskName: taskName,
      type: "active",
    };
    tasks.active.push(task);
    tasks.all.push(task);
    tasks.activeSequence++;
    localStorage.setItem("tasks", JSON.stringify(tasks));

    return task;
  };

  const setTaskHTML = (task, fragment) => {
    const element = document.createElement("li");
    element.classList.add("list__item");
    const imgContainer = document.createElement("div");
    imgContainer.classList.add("list__img-container");
    const p = document.createElement("p");
    p.textContent = task.taskName;
    p.classList.add("list__text");
    const imgCross = document.createElement("img");
    imgCross.src = "assets/img/icon-cross.svg";
    imgCross.alt = "cross-icon";
    imgCross.classList.add("list__img-cross");

    const idValue = document.createElement("input");
    idValue.type = "hidden";
    idValue.value = task.id;

    const typeTask = document.createElement("input");
    typeTask.type = "hidden";
    typeTask.value = task.type;

    if (task.type == "completed") {
      imgContainer.classList.add("list__img-container--complete");
      p.classList.add("list__text--complete");
    }

    element.appendChild(imgContainer);
    element.appendChild(p);
    element.appendChild(imgCross);
    element.appendChild(idValue);
    element.appendChild(typeTask);
    fragment.appendChild(element);
  };

  const getTasks = (type) => {
    Object.defineProperty(tasks, "all", {
      writable: true,
      enumerable: true,
      configurable: true,
      value: [...tasks.completed, ...tasks.active],
    });
    const fragment = document.createDocumentFragment();

    tasks[type].forEach((task) => {
      setTaskHTML(task, fragment);
    });

    return fragment;
  };

  todoList.insertBefore(getTasks("all"), todoList.lastElementChild);
  // Mostramos las tareas pendientes
  todoList.lastElementChild.firstElementChild.textContent = `${tasks["active"].length} items left`;

  // Evento que va a gestionar el comportamiento de los botones All, Active, Completed (filtro)
  options.addEventListener("click", (e) => {
    if (e.target.classList.contains("options__button")) {
      optionButtons.forEach((button) => {
        button.classList.remove("options__button--active");
      });
      e.target.classList.add("options__button--active");

      // Guardamos todos los li menos el último ya que ese no está asociado a ninguna tarea.
      const listItems = [
        ...document.querySelectorAll("#list .list__item"),
      ].slice(0, this.length - 1);

      // Eliminamos del DOM cada uno de los li para mostrar los nuevos filtrados.
      listItems.forEach((task) => {
        task.remove();
      });

      // Creo un fragmento en el que insertaré todas las listas del array dependiendo del filtro que se haya seleccionado
      const fragment = getTasks(e.target.value);

      // Los insertamos antes del ultimo li ya que es el que no está asociado a ninguna tarea (el que contiene 0 items left, etc...)
      todoList.insertBefore(fragment, todoList.lastElementChild);

      // Guardo el tipo para mostrar las tareas pendientes o completadas.
      let type = "";
      e.target.value == "completed" ? (type = "completed") : (type = "active");

      todoList.lastElementChild.firstElementChild.textContent = `${tasks[type].length} items left`;
    }
  });

  // Pongo el formulario a la escucha (el que se encarga de añadir una tarea)
  form.addEventListener("submit", (e) => {
    // Evito la propagacion del evento submit
    e.preventDefault();

    // Solo se  llevará acabo si se ha escrito algo en el input text del formulario
    if (textTodo.value != "") {
      // Creo la tarea activa en el objeto
      const task = createTask(textTodo.value);
      // Guardo el tipo de filtro que hay en el momento de insertar en el formulario
      let type = optionButtons.filter((option) =>
        option.classList.contains("options__button--active")
      );
      // Creo un document fragment para insertar las tareas dependiendo del tipo de filtro.
      const fragment = document.createDocumentFragment();
      setTaskHTML(task, fragment);
      // Los insertamos antes del ultimo li ya que es el que no está asociado a ninguna tarea (el que contiene 0 items left, etc...)
      todoList.insertBefore(fragment, todoList.lastElementChild);

      // Para evitar que muestre la longitud del array de all someto el tipo a un ternario en el que si es completed será completed y en caso de que no lo sea
      // (puede ser active u all) va a ser active
      type[0].value == "completed" ? (type = "completed") : (type = "active");

      todoList.lastElementChild.firstElementChild.textContent = `${tasks[type].length} items left`;

      // Reseteo estilos del input y el label del formulario
      textTodo.value = "";
      textTodo.classList.remove("todo__input--active");
      label.classList.remove("todo__placeholder--active");
    }
  });

  // Someto el input text a un evento input (registra keyup, keypress y keydown)
  textTodo.addEventListener("input", (e) => {
    // Si no hay nada escrito se quitan los modificadores active del input y el label, en caso contrario se añaden
    if (e.target.value == "") {
      e.target.classList.remove("todo__input--active");
      label.classList.remove("todo__placeholder--active");
    } else {
      e.target.classList.add("todo__input--active");
      label.classList.add("todo__placeholder--active");
    }
  });

  // Pongo el ul (la lista) a la escucha de un evento click
  todoList.addEventListener("click", (e) => {
    // Guardo el tipo de filtro
    const type = optionButtons.filter((option) =>
      option.classList.contains("options__button--active")
    );

    // Guardo en una variable de bloque el filtro de nuevo
    let typeTask = type[0].value;
    // Si se da click en la imagen de la X se eliminará esa tarea
    if (e.target.classList.contains("list__img-cross")) {
      // Vuelvo a guardar el tipo de filtro
      let typeTask = type[0].value;
      // Recojo el li (es decir, el HTML de la tarea a eliminar)
      const element = e.target.parentElement;

      //   Creo el objeto correspondiente a esa tarea
      const task = {
        id: parseInt(element.lastElementChild.previousElementSibling.value),
        taskName: element.firstElementChild.nextElementSibling.textContent,
        type: element.lastElementChild.value,
      };
      // La elimino del HTML
      element.remove();
      // Si el filtro es all se buscará primero si es una tara activa, para cambiar el tipo de filtro a active o completed.
      if (typeTask == "all") {
        if (tasks.active.some((item) => item.id == task.id)) {
          typeTask = "active";
        } else {
          typeTask = "completed";
        }
      }
      // Gracias a saber en que tipo de tarea está insertada (active o completed) eliminamos la tarea del array
      const idx = tasks.active.findIndex((item) => item.id == task.id);
      tasks[typeTask].splice(idx, 1);

      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    // Si damos click en el circulito significará que queremos completar o volver a dejar pendiente la tarea
    if (e.target.classList.contains("list__img-container")) {
      // Recojo el li (es decir, el HTML de la tarea a eliminar)
      const element = e.target.parentElement;
      const task = {
        id: parseInt(element.lastElementChild.previousElementSibling.value),
        taskName: element.firstElementChild.nextElementSibling.textContent,
        type: element.lastElementChild.value,
      };

      // Si es una tarea activa se realizarán las operaciones para completarla. En caso contrario se volverá a dejar pendiente
      if (tasks.active.some((item) => item.id == task.id)) {
        const idx = tasks.active.findIndex((item) => item.id == task.id);
        tasks.active.splice(idx, 1);
        task.type = "completed";
        element.lastElementChild.value = "completed";
        tasks.completed.push(task);
      } else {
        const idx = tasks.completed.findIndex((item) => item.id == task.id);

        tasks.completed.splice(idx, 1);
        task.type = "active";
        element.lastElementChild.value = "active";
        tasks.active.push(task);
      }

      localStorage.setItem("tasks", JSON.stringify(tasks));

      // Alternamos los estilos para que se vea como una tarea completa o pendiente.
      e.target.classList.toggle("list__img-container--complete");
      e.target.nextElementSibling.classList.toggle("list__text--complete");
    }
    // Por ultimo si el filtro es completed se mostrará el numero de tareas completadas, en caso contrario(que sea active u all) se mostrará unicamente el numero de tareas pendientes
    typeTask == "completed"
      ? (todoList.lastElementChild.firstElementChild.textContent = `${tasks["completed"].length} items left`)
      : (todoList.lastElementChild.firstElementChild.textContent = `${tasks["active"].length} items left`);
  });

  // Ponemos a la escucha el botón con el texto Clear Completed para eliminar las tareas completadas tanto del HTML como del array.
  clearButton.addEventListener("click", () => {
    const listItems = [...todoList.querySelectorAll("li.list__item")].filter(
      (item) => item.lastElementChild.value == "completed"
    );

    listItems.forEach((task) => {
      task.remove();
    });

    tasks.completed.splice(0, tasks.completed.length);

    localStorage.setItem("tasks", JSON.stringify(tasks));
  });
});
