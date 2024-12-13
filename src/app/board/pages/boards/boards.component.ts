import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {AuthenticationService} from "../../../iam/services/authentication.service";
import {BoardService} from "../../services/board.service";
import {Board} from "../../model/board.entity";
import {JsonPipe, NgForOf} from "@angular/common";
import {BoardItemComponent} from "../../components/board-item/board-item.component";
import {MatDialog} from "@angular/material/dialog";
import {BoardDialogComponent} from "../../components/board-dialog/board-dialog.component";
import {Profile} from "../../../profile/model/profile.entity";
import {MemberService} from "../../services/member.service";
import {Member} from "../../model/member.entity";
import {from, lastValueFrom} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [
    JsonPipe,
    BoardItemComponent,
    NgForOf
  ],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css'
})
export class BoardsComponent implements OnInit, AfterViewInit {
  @ViewChild('ownedBoardsContainer', { static: true }) ownedBoardsContent!: ElementRef;
  @ViewChild('colabBoardsContainer', { static: true }) colabBoardsContent!: ElementRef;

  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private boardService: BoardService = inject(BoardService);
  private memberService: MemberService = inject(MemberService);
  private router: Router = inject(Router);

  readonly taskDialog = inject(MatDialog);

  private userId = this.authenticationService.userId;

  ownedBoards = signal<Board[]>([]);
  duplicateOwnedBoards = computed(() => [...this.ownedBoards(), ...this.ownedBoards()]);
  memberBoards = signal<Board[]>([]);
  duplicateMemberBoards = computed(() => [...this.memberBoards(), ...this.memberBoards()]);

  constructor() {
  }

  ngOnInit() {
    this.getAllOwnedBoards();
    this.getAllMemberBoards();
  }

  ngAfterViewInit() {

    this.enableDrag(this.ownedBoardsContent);
    this.enableDrag(this.colabBoardsContent);

    this.startAutoScroll(this.ownedBoardsContent);
    this.startAutoScroll(this.colabBoardsContent);
  }

  private getAllOwnedBoards() {
    if (!this.isValidUserId()) return;
    this.boardService.getAllByOwnerId(this.userId()).subscribe({
      next: (boards) => this.ownedBoards.set(boards),
      error: (error) => console.error(error)
    });
  }

  private getAllMemberBoards() {
    if (!this.isValidUserId()) return;
    this.boardService.getAllByMemberId(this.userId()).subscribe({
      next: (boards) => this.memberBoards.set(boards),
      error: (error) => console.error(error)
    });
  }

  private isValidUserId() {
    return this.userId() != 0;
  }

  private createBoardAndMembers(board: Board, members: Profile[]) {
    board.ownerId = this.userId();
    this.boardService.create(board).subscribe({
      next: (createdBoard: Board) => {
        this.getAllOwnedBoards();
        this.navigateToBoard(createdBoard.id);
        this.createMembers(members, createdBoard.id).subscribe({
          next: () => {},
          error: (error) => console.error('Error creating members:', error),
        });
      },
      error: (error) => console.error('Error creating board:', error),
    });
  }

  private createMembers(members: Profile[], boardId: number) {
    const membersRequest = members.map(member =>
      lastValueFrom(this.memberService.createMember(new Member({ userId: member.userId, boardId }), boardId))
    );
    return from(Promise.all(membersRequest));
  }

  private navigateToBoard(boardId: number) {
    this.router.navigate(['/boards', boardId]).then();
  }

  protected openBoardDialog() {
    const dialogRef = this.taskDialog.open(BoardDialogComponent, {
      data: { board: new Board(), members: [] }
    });
    dialogRef.afterClosed().subscribe({
      next: (result: { board: Board, members: Profile[] }) => {
        if (!result) return;
        if (!result.board.title || !result.board.description) {
          // TODO: Show toast message
          console.error('Board title and description are required');
          return;
        }
        this.createBoardAndMembers(result.board, result.members);
      },
      error: (error) => console.error(error)
    });
  }

  private enableDrag(track: ElementRef) {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const element = track.nativeElement;

    element.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      element.style.cursor = 'grabbing';
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
      isDragging = false;
      element.style.cursor = 'grab';
    });

    element.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.cursor = 'grab';
    });

    element.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = x - startX;
      element.scrollLeft = scrollLeft - walk;
    });
  }

  protected handleInfiniteScroll(container: ElementRef) {
    const element = container.nativeElement;
    const scrollWidth = element.scrollWidth / 2;

    console.log('scrollWidth', scrollWidth, 'element.scrollLeft', element.scrollLeft);

    if (element.scrollLeft === 10) {
      element.scrollLeft = scrollWidth;
    }

    if (element.scrollLeft >= scrollWidth) {
      element.scrollLeft = 1;
    }
  }
  private startAutoScroll(container: ElementRef) {
    const element = container.nativeElement;
    const scrollWidth = element.scrollWidth / 2;
    let scrollAmount = 0;

    const interval = setInterval(() => {
      scrollAmount += 1;
      element.scrollLeft += 1;

      if (element.scrollLeft >= scrollWidth) {
        element.scrollLeft = 0;
        scrollAmount = 0;
      }
    }, 16);

    element.addEventListener('mouseenter', () => clearInterval(interval));
    element.addEventListener('mouseleave', () => this.startAutoScroll(container));
  }
}
