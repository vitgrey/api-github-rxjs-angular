import { Component, OnInit } from '@angular/core';
import { fromEvent, EMPTY } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError,filter } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    const url = 'https://api.github.com/search/users?q='
    const search = document.getElementById('search')
    const result = document.getElementById('result')

    const stream$ = fromEvent(search, 'input')
      .pipe(
        map(event => event.target['value']),
        debounceTime(1000),
        distinctUntilChanged(),
        tap( () => result.innerHTML = ''),
        filter( value => value.trim()),
        switchMap(value => ajax.getJSON(url + value).pipe(
          catchError( error => EMPTY)
        )),
        map(responce => responce['items']),
        mergeMap(items => items)
      )

    stream$.subscribe(user => {
      const html = `
        <div class="card">
          <div class="card-image">
            <img src="${user['avatar_url']}">
            <span class="card-title">${user['login']}</span>
          </div>
          <div class="card-content">
            <p>user id: ${user['id']}</p>
          </div>
          <div class="card-action">
            <a href="${user['html_url']}">GitHub link</a>
          </div>
        </div>
     `
      result.insertAdjacentHTML('beforeend', html)
    })
  }
}
