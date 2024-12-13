import {Component, computed, inject, signal} from '@angular/core';
import {AuthenticationService} from "../../../iam/services/authentication.service";
import {TaskService} from "../../../task/services/task.service";
import {ActivatedRoute} from "@angular/router";
import {Task, TaskStatus} from "../../../task/model/task.entity";
import {JsonPipe} from "@angular/common";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {TaskItemComponent} from "../../../task/components/task-item/task-item.component";
import {MatDialog} from "@angular/material/dialog";
import {TaskDialogComponent} from "../../../task/components/task-dialog/task-dialog.component";

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    JsonPipe,
    CdkDropList,
    CdkDrag,
    TaskItemComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private taskService: TaskService = inject(TaskService);
  private route: ActivatedRoute = inject(ActivatedRoute);

  readonly taskDialog = inject(MatDialog);
  private userId = this.authenticationService.userId;
  private boardId = signal(0);
  private tasks = signal<Task[]>([]);
  protected filteredTasksByStatusTodo = computed(() => this.tasks().filter(task => task.status === TaskStatus.todo));
  protected filteredTasksByStatusInProgress = computed(() => this.tasks().filter(task => task.status === TaskStatus.inProgress));
  protected filteredTasksByStatusDone = computed(() => this.tasks().filter(task => task.status === TaskStatus.done));

  constructor() {
  }

  ngOnInit() {
    this.boardId.set(this.route.snapshot.params['id']);
    this.getAllTasks();
  }

  protected openTaskDialog(task: Task = new Task(), isNew: boolean = true) {
    const dialogRef = this.taskDialog.open(TaskDialogComponent, {
      data: { task, isNew }
    });
    dialogRef.afterClosed().subscribe({
      next: (result: Task) => {
        result.boardId = Number(this.boardId());
        result.userId = this.userId();
        if (isNew){
          this.createTask(result);
        } else {
          this.updateTask(result);
        }
      },
      error: (error) => console.error(error)
    });
  }

  protected drop(event: CdkDragDrop<Task[]>){
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const containerId = event.container.id;
      this.updateTaskStatus(task, containerId);
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  private createTask(task: Task) {
    this.taskService.create(task).subscribe({
      next: () => this.getAllTasks(),
      error: (error) => console.error(error)
    });
  }

  private updateTask(task: Task) {
    this.taskService.patch(task.id, task).subscribe({
      next: () => this.getAllTasks(),
      error: (error) => console.error(error)
    });
  }

  private updateTaskStatus(task: Task, containerId: string) {
    task.status = this.getTaskStatusByContainerId(containerId);
    this.taskService.patch(task.id, task).subscribe({
      error: (error) => console.error(error)
    });
  }

  private getTaskStatusByContainerId(containerId: string): TaskStatus {
    switch (containerId) {
      case 'todo':
        return TaskStatus.todo;
      case 'inProgress':
        return TaskStatus.inProgress;
      case 'done':
        return TaskStatus.done;
      default:
        console.error(`Unknown container ID: ${containerId}`);
        return TaskStatus.todo;
    }
  }

  private getAllTasks() {
    if (!this.isValidBoardId()) return;
    this.taskService.getAllByBoardId(this.boardId()).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (error) => console.error(error)
    });
  }

  private isValidBoardId() {
    return this.boardId() > 0;
  }

  protected deleteTask(task: Task) {
    this.taskService.delete(task.id).subscribe({
      next: () => this.getAllTasks(),
      error: (error) => console.error(error)
    });
  }
}
