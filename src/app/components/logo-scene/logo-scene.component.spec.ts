import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoSceneComponent } from './logo-scene.component';

describe('LogoSceneComponent', () => {
  let component: LogoSceneComponent;
  let fixture: ComponentFixture<LogoSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogoSceneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogoSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
