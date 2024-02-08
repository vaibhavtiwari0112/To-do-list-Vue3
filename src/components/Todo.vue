<template>
  <div class="todo-container">
    <header>
      <div class="overlay">
        <h1>To-Do List</h1>
      </div>
    </header>
    <div class="todo-input">
      <label class="input-group__label" for="myInput">Add Task</label>
      <input
        v-model="newTask"
        @keyup.enter="addTask"
        id="myInput"
        class="input-group__input"
        placeholder="Add a new task"
      />

      <button class="button-85" @click="addTask">
        <i class="fas fa-plus"></i> Add
      </button>
    </div>
    <v-app>
      <v-tabs v-model="activeTab" class="todo-tabs">
        <v-tab
          v-for="(tab, index) in tabs"
          :key="index"
          @click="changeTab(tab)"
          :class="{ 'active-tab': activeTab === tab }"
        >
          {{ tab }}
        </v-tab>
      </v-tabs>
      <v-tab-item v-for="(tab, index) in tabs" :key="index" :value="tab">
        <v-card color="basil" flat class="todo-list-card">
          <v-card-text>
            <table v-if="activeTab === tab" class="todo-table">
              <thead class="tbl-header">
                <tr>
                  <th>Task</th>
                  <th>Created Date</th>
                  <th v-if="activeTab === 'Completed'">Completion Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="task in displayedTasks" :key="task.id">
                  <td>
                    <template v-if="task.editing">
                      <input
                        v-model="task.editedText"
                        @keyup.enter="saveTask(task)"
                      />
                    </template>
                    <template v-else>
                      {{ task.text }}
                    </template>
                  </td>

                  <td>{{ task.createdAt }}</td>
                  <td v-if="activeTab === 'Completed'">
                    {{ task.CompletedAt }}
                  </td>
                  <td>
                    <span v-if="activeTab == 'Ongoing'">
                      <button
                        class="button-32"
                        @click="editTask(task)"
                        v-if="!task.editing"
                      >
                        Edit
                      </button>
                      <button class="button-32" @click="saveTask(task)" v-else>
                        Save
                      </button>
                    </span>
                    <button
                      v-if="activeTab !== 'Completed'"
                      @click="completeTask(task.id)"
                      class="button-33"
                    >
                      Complete
                    </button>
                    <button @click="deleteTask(task.id)" class="button-62">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-app>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed } from "vue";

export default {
  name: "TodoList",
  setup() {
    const newTask = ref("");
    const tasks = ref([]);
    const CompletedTasks = ref([]);
    const OngoingTasks = ref([]);
    const $axios = inject("$axios");
    const activeTab = ref("Ongoing");

    const addTask = async () => {
      if (newTask.value.trim() !== "") {
        const response = await $axios.post("http://localhost:3000/tasks", {
          text: newTask.value,
          createdAt: new Date().toLocaleString(),
          Completed: false,
          CompletedAt: null,
        });
        tasks.value.push(response.data);
        OngoingTasks.value.push(response.data);
        newTask.value = "";
      }
    };

    const deleteTask = async (taskId) => {
      try {
        await $axios.delete(`http://localhost:3000/tasks/${taskId}`);

        tasks.value = tasks.value.filter((task) => task.id !== taskId);
        CompletedTasks.value = CompletedTasks.value.filter(
          (task) => task.id !== taskId
        );
        OngoingTasks.value = OngoingTasks.value.filter(
          (task) => task.id !== taskId
        );
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    };
    const editTask = (task) => {
      task.editing = true;
      task.editedText = task.text;
    };

    const saveTask = async (task) => {
      task.editing = false;
      // Update task text in the database
      await $axios.patch(`http://localhost:3000/tasks/${task.id}`, {
        text: task.editedText,
      });
      task.text = task.editedText;
    };
    const completeTask = async (taskId) => {
      const taskIndex = tasks.value.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const response = await $axios.patch(
          `http://localhost:3000/tasks/${taskId}`,
          {
            Completed: true,
            CompletedAt: new Date().toLocaleString(),
          }
        );

        const updatedTask = {
          ...tasks.value[taskIndex],
          Completed: true,
          CompletedAt: response.data.CompletedAt,
        };

        OngoingTasks.value = OngoingTasks.value.filter(
          (task) => task.id !== taskId
        );

        tasks.value = [
          ...tasks.value.slice(0, taskIndex),
          updatedTask,
          ...tasks.value.slice(taskIndex + 1),
        ];

        CompletedTasks.value.push(updatedTask);
      }
    };

    onMounted(async () => {
      const response = await $axios.get("http://localhost:3000/tasks");
      tasks.value = response.data;
      CompletedTasks.value = response.data.filter((task) => task.Completed);
      OngoingTasks.value = response.data.filter((task) => !task.Completed);
    });

    const displayedTasks = computed(() => {
      return activeTab.value === "Completed"
        ? CompletedTasks.value
        : OngoingTasks.value;
    });

    const tabs = ["Ongoing", "Completed"];

    const changeTab = (tab) => {
      activeTab.value = tab;
    };

    return {
      newTask,
      tasks,
      CompletedTasks,
      OngoingTasks,
      addTask,
      completeTask,
      deleteTask,
      activeTab,
      displayedTasks,
      tabs,
      changeTab,
      editTask,
      saveTask,
    };
  },
};
</script>
<style scoped>
.todo-container {
  text-align: center;
  margin-top: 50px;
}

.todo-heading {
  font-size: 24px;
  margin-bottom: 20px;
}

.todo-input {
  margin-bottom: 20px;
}

.todo-input input {
  padding: 10px;
  margin-right: 10px;
}

.todo-tabs {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.todo-tabs v-tab {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  transition: background-color 0.3s ease;
}

.todo-tabs v-tab:hover {
  color: blue;
  border-bottom: 1px solid #ddd;
}

.todo-tabs v-tab-item {
  background-color: #f2f2f2;
  border: 1px solid blue;
  border-radius: 2px;
  width: 70%;
  margin: 0 auto;
  transition: background-color 0.3s ease;
}

.todo-tabs v-tab-item.active {
  border-bottom: 1px solid blue;
  color: blue;
}

.todo-list-card {
  width: 100%;
  margin: 0 auto;
}

.todo-table {
  width: 90%;
  margin: 0 auto;
  border-collapse: collapse;
  margin-top: 20px;
}

.todo-table th,
.todo-table td {
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 14px;
  text-align: center;
}

.todo-tabs v-tab-item[value="Completed"] {
  color: gray;
}

.active-tab {
  font-size: 24px;
}

.button-33 {
  background-color: #c2fbd7;
  border-radius: 100px;
  box-shadow: rgba(44, 187, 99, 0.2) 0 -25px 18px -14px inset,
    rgba(44, 187, 99, 0.15) 0 1px 2px, rgba(44, 187, 99, 0.15) 0 2px 4px,
    rgba(44, 187, 99, 0.15) 0 4px 8px, rgba(44, 187, 99, 0.15) 0 8px 16px,
    rgba(44, 187, 99, 0.15) 0 16px 32px;
  color: green;
  cursor: pointer;
  display: inline-block;
  font-family: CerebriSans-Regular, -apple-system, system-ui, Roboto, sans-serif;
  padding: 7px 20px;
  text-align: center;
  text-decoration: none;
  transition: all 250ms;
  border: 0;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  margin-right: 20px;
}

.button-33:hover {
  box-shadow: rgba(44, 187, 99, 0.35) 0 -25px 18px -14px inset,
    rgba(44, 187, 99, 0.25) 0 1px 2px, rgba(44, 187, 99, 0.25) 0 2px 4px,
    rgba(44, 187, 99, 0.25) 0 4px 8px, rgba(44, 187, 99, 0.25) 0 8px 16px,
    rgba(44, 187, 99, 0.25) 0 16px 32px;
  transform: scale(1.05) rotate(-1deg);
}
.button-62 {
  background: linear-gradient(to bottom right, #ef4765, #ff9a5a);
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 2.5;
  outline: transparent;
  padding: 0 1rem;
  text-align: center;
  text-decoration: none;
  transition: box-shadow 0.2s ease-in-out;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
}

.button-62:not([disabled]):focus {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-62:not([disabled]):hover {
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5),
    -0.125rem -0.125rem 1rem rgba(239, 71, 101, 0.5),
    0.125rem 0.125rem 1rem rgba(255, 154, 90, 0.5);
}

.button-85 {
  padding: 0.6em 2em;
  border: none;
  outline: none;
  color: rgb(255, 255, 255);
  background: #111;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 10px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-85:before {
  content: "";
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00c8,
    #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing-button-85 20s linear infinite;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}

@keyframes glowing-button-85 {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.button-85:after {
  z-index: -1;
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #222;
  left: 0;
  top: 0;
  border-radius: 10px;
}
.input-group {
  width: 100%;
  max-width: 20em;
  display: flex;
  flex-direction: column;
  z-index: 2;
  padding: 10px;
  margin-left: 310px;
}

.input-group__label {
  padding: 0 0.5em;
  margin-bottom: 0.5em;
  text-transform: uppercase;
  font-size: 0.875em;
  letter-spacing: 0.1em;
  color: #ccd;
  color: rgba(255, 220, 255, 0.6);
  cursor: pointer;
}

.input-group__input {
  color: #fff;
  font-size: 1.25rem;
  line-height: 1;
  padding: 10px;
  margin-right: 10px;
  border-style: none;
  outline: none;
  height: calc(1em + 1.6em + 0.5em);
  width: 25%;
  padding: 0.8em 1em;
  border: 0.25em solid transparent;
  background-image: linear-gradient(#000, #000),
    linear-gradient(120deg, #f09 0%, #0ff 50%, #9f0 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border-radius: 1.8em;
  background-size: 200% 100%;
  transition: background-position 0.8s ease-out;
}

.input-group__input:hover {
  background-position: 100% 0;
}
table {
  width: 100%;
  table-layout: fixed;
}
.tbl-header {
  background-color: rgba(255, 255, 255, 0.3);
}
.tbl-content {
  height: 300px;
  overflow-x: auto;
  margin-top: 0px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
th {
  padding: 20px 15px;
  text-align: left;
  font-weight: 500;
  font-size: 12px;
  color: #fff;
  text-transform: uppercase;
}
td {
  padding: 15px;
  text-align: left;
  vertical-align: middle;
  font-weight: 300;
  font-size: 12px;
  color: #fff;
  border-bottom: solid 1px rgba(255, 255, 255, 0.1);
}
@import url(https://fonts.googleapis.com/css?family=Roboto:400,500,300,700);
table {
  background: -webkit-linear-gradient(left, #25c481, #25b7c4);
  background: linear-gradient(to right, #25c481, #25b7c4);
  font-family: "Roboto", sans-serif;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

header {
  text-align: center;
  width: 100%;
  height: auto;
  background-size: cover;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 85% 85% / 30%;
  margin-left: 500px;
}
header .overlay {
  width: 40%;
  height: 10%;
  padding: 10px;
  color: black;
  text-shadow: 1px 1px 1px #333;
}

h1 {
  font-family: "Dancing Script", cursive;
  font-size: 40px;
  margin-bottom: 10px;
}

.button-32 {
  background-color: #fff000;
  border-radius: 12px;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  padding: 10px 15px;
  text-align: center;
  transition: 200ms;
  width: 15%;
  box-sizing: border-box;
  border: 0;
  margin-right: 20px;
  font-size: 12px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-32:not(:disabled):hover,
.button-32:not(:disabled):focus {
  outline: 0;
  background: #f4e603;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2), 0 3px 8px 0 rgba(0, 0, 0, 0.15);
}

.button-32:disabled {
  filter: saturate(0.2) opacity(0.5);
  -webkit-filter: saturate(0.2) opacity(0.5);
  cursor: not-allowed;
}
</style>
