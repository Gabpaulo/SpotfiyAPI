import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderDetailPage } from './folder-detail.page';

describe('FolderDetailPage', () => {
  let component: FolderDetailPage;
  let fixture: ComponentFixture<FolderDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
