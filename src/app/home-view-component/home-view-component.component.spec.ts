import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeViewComponentComponent } from './home-view-component.component';

describe('HomeViewComponentComponent', () => {
  let component: HomeViewComponentComponent;
  let fixture: ComponentFixture<HomeViewComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeViewComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeViewComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
