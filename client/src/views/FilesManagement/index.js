import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FilesTable, FilesToolbar } from './components';
import { makeStyles } from '@material-ui/core';
import { Selectors, Actions } from 'state/modules/app/files';

import { useSelector, useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    padding: theme.spacing(3)
  }
}))

function FilesManagement() {

  const classes = useStyles();
  const filesStore = useSelector(Selectors.filesStore);
  const dispatch = useDispatch();

  useEffect(() => {
    (filesStore.status !== 'LOADED') && dispatch({ type: Actions.FETCH_FILES })
  }, [filesStore.status])

  const files = Object.values(filesStore.byId);

  return (
    <div className={classes.root} >
      <FilesToolbar />
      <FilesTable
        files={files}
      />
    </div>
  )
}

FilesManagement.propTypes = {

}

export default FilesManagement
