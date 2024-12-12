import {Component, computed, Input} from '@angular/core';
import {Task, TaskStatus} from "../../model/task.entity";
import {MatRipple} from "@angular/material/core";
import {LowerCasePipe} from "@angular/common";

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    MatRipple,
    LowerCasePipe
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  @Input() task!: Task;

  protected status = computed(() => this.getStatusClass(this.task.status));

  private getStatusClass(status: TaskStatus): string {
    if (status === TaskStatus.inProgress) return 'in-progress';
    return status;
  }
}
