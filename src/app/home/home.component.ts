import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';

interface IUndoRedoForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  country: FormControl<string | null>;
}

type ExtractFormControl<T> = {
  [K in keyof T]: T[K] extends FormControl<infer U> ? U : T[K];
};
type undoRedoFormValue = ExtractFormControl<IUndoRedoForm>;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, ToastrModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  myForm!: FormGroup;
  history: undoRedoFormValue[] = [];
  currentIndex: number = -1;
  countries: string[] = ['Egypt', 'China', 'USA', 'KSA', 'Poland'];

  private fb: FormBuilder = inject(FormBuilder);
  private toastr: ToastrService = inject(ToastrService);

  /**
   * Initializes the form with empty values for 'name', 'email', and 'country'.
   * Calls 'saveState' to save the initial state of the form.
   * Subscribes to value changes in the form to trigger 'saveState' on any change.
   */
  ngOnInit(): void {
    this.myForm = this.fb.group<IUndoRedoForm>({
      name: new FormControl<string | null>(''),
      email: new FormControl<string | null>(''),
      country: new FormControl<string | null>(''),
    });

    this.saveState();
    this.myForm.valueChanges.subscribe(() => {
      this.saveState();
    });
  }

  /**
   * Saves the current state of the form.
   * If the currentIndex is not at the latest state in the history, removes all subsequent states.
   * Updates the history with the current state and sets the currentIndex to the latest state.
   */
  saveState() {
    const currentState = this.myForm.value;
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }
    this.history.push(currentState);
    this.currentIndex = this.history.length - 1;
  }

  /**
   * Decrements the current index and updates the form with the previous value from the history.
   * Displays a success message using Toastr upon successful undo action.
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      this.myForm.setValue(this.history[this.currentIndex], {
        emitEvent: false,
      });
      this.toastr.success('⤶ Undo action had been done');
    }
  }

  /**
   * Redoes the last action if available.
   * Increases the current index, sets the form value to the next history state,
   * and displays a success message using Toastr.
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      this.myForm.setValue(this.history[this.currentIndex], {
        emitEvent: false,
      });
      this.toastr.success('↪️ Redo action had been done');
    }
  }

  /**
   * Check if current index not at the beginning of the array so the Undo can be called
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if current index not at the end of the array so the redo can be called
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
