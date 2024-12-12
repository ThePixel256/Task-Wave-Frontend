import {Component, inject, model} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {TaskDialogDataInterface} from "../../model/task-dialog-data.interface";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDialogTitle,
    MatButton,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    FormsModule,
    MatLabel
  ],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.css'
})

export class TaskDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  readonly data = inject<TaskDialogDataInterface>(MAT_DIALOG_DATA);
  readonly task = model(this.data.task);
  readonly isNew = model(this.data.isNew);

  constructor() {
  }

  protected onNoClick(): void {
    // TODO: Reset form values to initial state
    this.dialogRef.close();
  }
}
