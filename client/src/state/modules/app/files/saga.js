import { all, put, select, takeEvery } from 'redux-saga/effects';
import * as Actions from './actions';
import { API_STATUS_CODE, TOAST_TYPE } from 'helpers/constant';
import {
  getFilesApi,
  uploadFileApi,
  downloadFileApi,
  deleteFilesApi,
  updateFileApi
} from 'helpers/filesApi';

import { getFileById } from 'state/modules/app/files/selector';
import { push } from 'connected-react-router';
import { saveAs } from 'file-saver';
import { showToast } from 'state/modules/notification';

function* uploadFile(action) {
  const { file } = action.payload;
  const res = yield uploadFileApi(file);

  if (res.status === API_STATUS_CODE.SUCCESS) {
    yield put(Actions.setFile(res.data.file));
    yield put(push('/files'));
    const toast = {
      message: 'File saved !',
      type: TOAST_TYPE.SUCCESS
    }
    yield put(showToast(toast));
  } else {
    const toast = {
      message: 'Upload file failed !',
      type: TOAST_TYPE.FAILED
    }
    yield put(showToast(toast));
  }
}

function* downloadFile(action) {
  const { fileId } = action.payload;
  const res = yield downloadFileApi(fileId);
  if (res.error) {
    console.log(res);
  }
  else {
    const file = yield select(state => getFileById(state)(fileId));
    const saveAsName = file.name || 'download.txt';
    saveAs(new Blob([res]), saveAsName);
  }
}

function* fetchFiles() {
  const res = yield getFilesApi();

  if (res.status === API_STATUS_CODE.SUCCESS) {
    console.log('get data success');

    yield put(Actions.setFiles(res.data.files))
  }
}

function* deleteFile(action) {
  const { fileId } = action.payload;
  yield put(Actions.deleteFile(fileId))
  const res = yield deleteFilesApi(fileId);
  if (res.status === API_STATUS_CODE.SUCCESS) {
    const toast = {
      message: 'Delete file succesfully !',
      type: TOAST_TYPE.SUCCESS
    }
    yield put(showToast(toast));
  } else {
    const toast = {
      message: 'Delete file failed !',
      type: TOAST_TYPE.FAILED
    }
    yield put(showToast(toast));
  }
}

function* updateFile(action) {
  const { file } = action.payload;

  yield put(Actions.setFile(file));
  const res = yield updateFileApi(file);
  if (res.status === API_STATUS_CODE.SUCCESS) {
    const toast = {
      message: 'Update file succesfully !',
      type: TOAST_TYPE.SUCCESS
    }
    yield put(showToast(toast));
  } else {
    const toast = {
      message: 'Update file failed !',
      type: TOAST_TYPE.FAILED
    }
    yield put(showToast(toast));
  }
}

export default function* filesSaga() {
  yield all([
    takeEvery(Actions.FETCH_FILES, fetchFiles),
    takeEvery(Actions.UPLOAD_FILE_SAGA, uploadFile),
    takeEvery(Actions.DOWNLOAD_FILE_SAGA, downloadFile),
    takeEvery(Actions.DELETE_FILE_SAGA, deleteFile),
    takeEvery(Actions.UPDATE_FILE_SAGA, updateFile),
  ])
}