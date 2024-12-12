import {Component, ElementRef, inject, model, signal, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {BoardDialogData} from "../../model/board-dialog-data.interface";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {Profile} from "../../../profile/model/profile.entity";
import {MatInput} from "@angular/material/input";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {ProfileService} from "../../../profile/services/profile.service";
import {AuthenticationService} from "../../../iam/services/authentication.service";
import {Board} from "../../model/board.entity";

@Component({
  selector: 'app-board-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogClose,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete
  ],
  templateUrl: './board-dialog.component.html',
  styleUrl: './board-dialog.component.css'
})
export class BoardDialogComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  readonly dialogRef = inject(MatDialogRef<BoardDialogComponent>);
  private authenticationService: AuthenticationService = inject(AuthenticationService);
  protected userId = this.authenticationService.userId;
  private readonly profileService: ProfileService = inject(ProfileService);
  readonly data = inject<BoardDialogData>(MAT_DIALOG_DATA);
  readonly board = model(this.data.board);
  readonly membersId = model(this.data.members);
  protected members = signal<Profile[]>([]);
  protected filteredMembers = signal<Profile[]>([]);
  protected selectedMembers = signal<Profile[]>([]);
  protected filteredMemberInputControl = new FormControl('');

  constructor() {
    this.getAllMembersProfile();
    this.filteredMembers.set(this.members().slice());
  }

  protected onNoClick(): void {
    // TODO: Reset form values to initial state
    this.dialogRef.close();
  }

  protected filterMembers(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredMembers.set(this.members().filter(member => {
      return member.firstName.toLowerCase().includes(filterValue) || member.lastName.toLowerCase().includes(filterValue) || member.email.toLowerCase().includes(filterValue);
    }));
  }

  protected addMember(member: Profile): void {
    this.input.nativeElement.value = '';
    if(this.selectedMembers().find(selectedMember => selectedMember.id === member.id)){
      // TODO: Display error message
      return;
    }
    this.selectedMembers.set([...this.selectedMembers(), member]);
  }

  protected removeMember(id: number) {
    this.selectedMembers.set(this.selectedMembers().filter(member => member.id !== id));
  }

  private getAllMembersProfile(){
    this.profileService.getAll().subscribe({
      next: (profiles: Profile[]) => {
        this.members.set(profiles);
      },
      error: (error: Error) =>  console.error(error)
    });
  }

  protected returnBoardDialogDataValue() {
    return {
      board: new Board({
        title: this.board().title,
        description: this.board().description
      }),
      members: this.selectedMembers()
    };
  }
}
