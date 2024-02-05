import { Component, OnInit } from "@angular/core";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-statistic-pivotgrid',
    templateUrl: './pivotgrid.component.html',
    styleUrls: ['./pivotgrid.component.scss'],
    providers: []
  })
  export class StatisticPivotgridComponent extends WithDestroy() implements OnInit {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

  }  