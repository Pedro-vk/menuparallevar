import { Component, OnInit } from '@angular/core';

import { SaveRestaurantGQL } from 'src/app/shared/graphql'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  constructor(private saveRestaurantGQL: SaveRestaurantGQL) { }

  ngOnInit(): void {
    this.saveRestaurantGQL.mutate({restaurant: {
      name: 'Restaurante Juan',
      phone: '601501401',
      menu: {
        name: 'Menú del día',
        price: 10.95,
        includeBread: true,
        includeBeverage: false,
        sections: [
          {title: 'Entrantes', items: ['Albóndigas de atún', 'Ensalada mixta']},
          {title: 'Primeros', items: ['Entrecot', 'Croquetas de jamón']},
          {title: 'Postre', items: ['Postre de leche de mípalo']},
        ],
      },
    }})
      .toPromise()
  }

}
