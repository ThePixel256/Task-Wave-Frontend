import {AfterViewInit, Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild} from '@angular/core';
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
  @ViewChild('ownedBoardsTrack', { static: true }) ownedBoardsTrack!: ElementRef;
  @ViewChild('ownedBoardsContainer', { static: true }) ownedBoardsContainer!: ElementRef;

  @ViewChild('colabBoardsTrack', { static: true }) colabBoardsTrack!: ElementRef;
  @ViewChild('colabBoardsContainer', { static: true }) colabBoardsContainer!: ElementRef;

  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private boardService: BoardService = inject(BoardService);
  private memberService: MemberService = inject(MemberService);
  private router: Router = inject(Router);

  readonly taskDialog = inject(MatDialog);

  private userId = this.authenticationService.userId;

  ownedBoards = signal<Board[]>([]);
  memberBoards = signal<Board[]>([]);

  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    this.getAllOwnedBoards();
    this.getAllMemberBoards();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkCarouselOverflow(this.ownedBoardsTrack, this.ownedBoardsContainer);
      this.checkCarouselOverflow(this.colabBoardsTrack, this.colabBoardsContainer);
    }, 100);

    window.addEventListener('resize', () => {
      this.checkCarouselOverflow(this.ownedBoardsTrack, this.ownedBoardsContainer);
      this.checkCarouselOverflow(this.colabBoardsTrack, this.colabBoardsContainer);
    });
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

  private checkCarouselOverflow(track: ElementRef, container: ElementRef) {
    const trackWidth = track.nativeElement.scrollWidth;
    const containerWidth = container.nativeElement.offsetWidth;
    if (trackWidth > containerWidth) {
      this.activateCarousel(track);
    } else {
      this.deactivateCarousel(track);
    }
  }

  private activateCarousel(track: ElementRef) {
    this.renderer.addClass(track.nativeElement, 'active');
  }

  private deactivateCarousel(track: ElementRef) {
    this.renderer.removeClass(track.nativeElement, 'active');
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
}
