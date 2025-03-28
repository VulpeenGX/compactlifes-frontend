import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollageImagesComponent } from './collage-images.component';

describe('CollageImagesComponent', () => {
  let component: CollageImagesComponent;
  let fixture: ComponentFixture<CollageImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollageImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollageImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
