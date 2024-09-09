import { Component, Inject, Input, OnInit } from "@angular/core";
import { EditLayoutItem } from "@ballware/meta-model";
import { EDIT_SERVICE, EditService } from "@ballware/meta-services";
import { takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { WithEditItemLifecycle } from "../../utils/withedititemlivecycle";
import { WithReadonly } from "../../utils/withreadonly";
import { WithRequired } from "../../utils/withrequired";
import { WithValidation } from "../../utils/withvalidation";
import { WithValue } from "../../utils/withvalue";
import { WithVisible } from "../../utils/withvisible";
import { CommonModule } from "@angular/common";
import { DxHtmlEditorModule, DxValidatorModule } from "devextreme-angular";

@Component({
    selector: 'ballware-edit-richtext',
    templateUrl: './richtext.component.html',
    styleUrls: ['./richtext.component.scss'],
    imports: [CommonModule, DxHtmlEditorModule, DxValidatorModule],
    standalone: true
  })
  export class EditLayoutRichtextComponent extends WithVisible(WithRequired(WithValidation(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => ""))))) implements OnInit {
  
    @Input() initialLayoutItem!: EditLayoutItem;
  
    public layoutItem: EditLayoutItem|undefined;
  
    constructor(@Inject(EDIT_SERVICE) private editService: EditService) {
      super();
    }
  
    ngOnInit(): void {
      if (this.initialLayoutItem) {
        this.initLifecycle(this.initialLayoutItem, this.editService, this);
  
        this.preparedLayoutItem$
          .pipe(takeUntil(this.destroy$))
          .subscribe((layoutItem) => {
            if (layoutItem) {
              this.initValue(layoutItem, this.editService);
              this.initReadonly(layoutItem, this.editService);
              this.initValidation(layoutItem, this.editService);
              this.initRequired(layoutItem, this.editService);
              this.initVisible(layoutItem);
  
              this.layoutItem = layoutItem;
            }
          });
      }
    }  
  }