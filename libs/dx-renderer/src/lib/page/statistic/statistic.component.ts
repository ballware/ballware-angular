import { Component, OnInit } from "@angular/core";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-page-statistic',
    templateUrl: './statistic.component.html',
    styleUrls: ['./statistic.component.scss'],
    providers: []
  })
  export class PageLayoutStatisticComponent extends WithDestroy() implements OnInit {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

  }  