import { Component, OnInit } from "@angular/core";
import { WithDestroy } from "../../utils/withdestroy";

@Component({
    selector: 'ballware-statistic-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: []
  })
  export class StatisticMapComponent extends WithDestroy() implements OnInit {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

  }  