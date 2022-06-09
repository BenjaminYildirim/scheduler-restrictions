import { Component, ViewEncapsulation } from '@angular/core';
import { CreateFormGroupArgs, EditMode } from '@progress/kendo-angular-scheduler';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

const intersects = (startTime1: Date, endTime1: Date, startTime2: Date, endTime2: Date) =>
    (startTime1 < startTime2 && endTime1 > endTime2) ||
    (startTime2 <= startTime1 && startTime1 < endTime2) ||
    (startTime2 < endTime1 && endTime1 <= endTime2);

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'my-app',
    template: `
        <kendo-scheduler
            [kendoSchedulerBinding]="events"
            [kendoSchedulerReactiveEditing]="createFormGroup"
            [selectedDate]="selectedDate"
            (add)="onAdd($event)"
            (edit)="onEdit($event)"
            (remove)="onRemove($event)"
            (dragStart)="onDragStart($event)"
            (drag)="onDrag($event)"
            (dragEnd)="onDragEnd($event)"
            (resizeStart)="onResizeStart($event)"
            (resize)="onResize($event)"
            (resizeEnd)="onResizeEnd($event)"
            style="height: 600px;"
        >
            <kendo-scheduler-month-view>
            </kendo-scheduler-month-view>
        </kendo-scheduler>
    `,
    styles: [`
        .invalid {
            background: red !important;
        }
    `]
})

export class AppComponent {

    public selectedDate: Date = new Date('2018-10-22T00:00:00');
    public events: any[] = [{
        id: 1,
        title: 'Feiertag',
        cat: 2,
        start: new Date('2018-10-25T09:00:00'),
        end: new Date('2018-10-25T09:30:00'),
        isAllDay: true,
        readonly: true
    }, 
    {
        id: 2,
        title: 'Schule',
        cat: 1,
        start: new Date('2018-10-22T10:00:00'),
        end: new Date('2018-10-22T10:30:00'),
        isAllDay: true,
    },
    {
        id: 3,
        title: 'Wordpress',
        cat: 3,
        start: new Date('2018-10-23T10:00:00'),
        end: new Date('2018-10-23T10:30:00'),
        isAllDay: true,
    },
    {
        id: 4,
        title: 'Wordpress',
        cat: 3,
        start: new Date('2018-10-24T10:00:00'),
        end: new Date('2018-10-24T10:30:00'),
        isAllDay: true,
    }
];
    public formGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.createFormGroup = this.createFormGroup.bind(this);
    }

    public createFormGroup(args: CreateFormGroupArgs): FormGroup {
        const dataItem = args.dataItem;
        const isOccurrence = args.mode === EditMode.Occurrence as any;
        const exceptions = isOccurrence ? [] : dataItem.recurrenceExceptions;

        this.formGroup = this.formBuilder.group({
            'id': args.isNew ? this.getNextId() : dataItem.id,
            'start': [dataItem.start, Validators.required],
            'end': [dataItem.end, Validators.required],
            'startTimezone': [dataItem.startTimezone],
            'endTimezone': [dataItem.endTimezone],
            'isAllDay': dataItem.isAllDay,
            'title': dataItem.title,
            'description': dataItem.description,
            'recurrenceRule': dataItem.recurrenceRule,
            'recurrenceId': dataItem.recurrenceId,
            'recurrenceExceptions': [exceptions]
        });

        return this.formGroup;
    }

    public onDragStart(args: any): void {
        this.preventReadonly(args);
    }

    public onDrag(args: any): void {
        if (this.occupiedSlot(args)) {
            args.setHintClass('invalid');
        }
    }

    public onDragEnd(args: any): void {
        if (this.occupiedSlot(args)) {
            args.preventDefault();
        }
    }

    public onResizeStart(args: any): void {
        this.preventReadonly(args);
    }

    public onResize(args: any): void {
        if (this.occupiedSlot(args)) {
            args.setHintClass('invalid');
        }
    }

    public onResizeEnd(args: any): void {
        if (this.occupiedSlot(args)) {
            args.preventDefault();
        }
    }

    public onRemove(args: any): void {
        this.preventReadonly(args);
    }

    public onEdit(args: any): void {
        this.preventReadonly(args);
    }

    public onAdd(args: any): void {
        if (this.occupiedSlot(args.dataItem)) {
            alert('Dieser Tag ist durch Ferien oder Schultage besetzt.');
            args.preventDefault();
        }
    }

    private preventReadonly(args: any): void {
        if (args.dataItem.readonly) {
            alert('The event cannot be changed.');
            args.preventDefault();
        }
    }

    private occupiedSlot(args: any): boolean {
        let occupied = false;

        this.events.find(e => {
            if (e !== args.dataItem && intersects(args.start, args.end, e.start, e.end) && (e.cat === 1 || e.cat === 2)) {
                occupied = true;
                return true;
            }
        });

        return occupied;
    }

    private getNextId(): number {
        const len = this.events.length;

        return (len === 0) ? 1 : this.events[this.events.length - 1].id + 1;
    }
}
