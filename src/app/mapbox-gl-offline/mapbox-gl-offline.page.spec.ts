import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapboxGlOfflinePage } from './mapbox-gl-offline.page';

describe('MapboxGlOfflinePage', () => {
  let component: MapboxGlOfflinePage;
  let fixture: ComponentFixture<MapboxGlOfflinePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboxGlOfflinePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxGlOfflinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
