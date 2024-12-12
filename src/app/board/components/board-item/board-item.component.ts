import {Component, Input} from '@angular/core';
import {Board} from "../../model/board.entity";
import {MatButton} from "@angular/material/button";
import {
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-board-item',
  standalone: true,
  imports: [
    MatButton,
    MatCardHeader,
    MatCardImage,
    MatCardContent,
    MatCardActions,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon
  ],
  templateUrl: './board-item.component.html',
  styleUrl: './board-item.component.css'
})
export class BoardItemComponent {
  @Input() board!: Board;

  constructor(private router: Router) {
  }

  protected navigateToBoard() {
    const boardId = this.board.id;
    this.router.navigate([`/boards/${boardId}`]).then();
  }
}
