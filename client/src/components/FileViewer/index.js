import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Typography,
  makeStyles,
  Grid,
  Chip,
  Avatar,
  Tooltip
} from '@material-ui/core'

import { Person, PersonAdd, VpnKey } from '@material-ui/icons'
import { Actions, Selectors } from 'state/modules/app/keys';
import { Selectors as keysSelector } from 'state/modules/app/files';
import { FETCH_USERS, usersSelector } from 'state/modules/app/users/actions';

import { useSelector, useDispatch } from 'react-redux';
import { isEmpty, get } from 'lodash';
import genAvataImg from 'helpers/genAvataImg';

const useStyle = makeStyles(theme => ({
  root: {
    margin: 0
  },
  container: {
    padding: theme.spacing(2),
    minWidth: '450px'
  },
  icons: {
    verticalAlign: 'middle'
  },
  chips: {
    marginRight: theme.spacing(1)
  }
}))

function FileViewer(props) {

  const classes = useStyle();
  const keysStore = useSelector(Selectors.keysStore);
  const usersStore = useSelector(usersSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    (keysStore.status !== 'LOADED') && dispatch({ type: Actions.FETCH_KEYS });
    (usersStore.status !== 'LOADED') && dispatch({ type: FETCH_USERS });
  }, [keysStore.status, usersStore.status])

  const { fileId, open = false } = props;
  const file = useSelector(state => keysSelector.getFileById(state)(fileId));
  const { keyId, owner } = file || '';
  const keyData = useSelector(state => Selectors.getKeyById(state, keyId));

  if (isEmpty(file) || isEmpty(keyData)) {
    return null;
  }

  const { permissions = {} } = keyData;

  const selectedUsers = Object.keys(permissions).map(userId => get(usersStore, ['byId', userId], ''));
  const ownerData = get(usersStore, ['byId', owner], {});

  const handleClose = () => {
    const { onClose } = props;
    onClose && onClose();
  }
  return (
    <Drawer
      anchor="right"
      className={classes.root}
      onClose={handleClose}
      open={open}
    >
      <Grid
        className={classes.container}
        container
        direction="column"
        spacing={3}
      >
        <Grid
          item
        >
          <Typography variant="h3">
            <strong>File:</strong> {file.name}
          </Typography>
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Owner:</strong> {ownerData.fullname}
          </Typography>
          <Person className={classes.icons} />
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Size:</strong>: {Math.floor(file.size / 1024)} KB
          </Typography>
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Link:</strong> <a >{`http://localhost:300/file/${file._id}`}</a>
          </Typography>
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Last access:</strong> asdasd
          </Typography>
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Protected by:</strong> {keyData.alias}
          </Typography>
          <VpnKey
            className={classes.icons}
            style={{ color: 'green' }}
          />
        </Grid>
        <Grid
          item
        >
          <Typography
            component="span"
            variant="body1"
          >
            <strong>Shared with:</strong>
            <PersonAdd className={classes.icons} />
          </Typography>
        </Grid>
        <Grid item>
          <Grid container>
            {
              selectedUsers.map(user => {
                const { displayName } = genAvataImg(user.fullname);
                return (
                  <Grid
                    item
                    lg={4}
                    sm={12}
                  >
                    <Tooltip
                      title={user.email}
                    >
                      <Chip
                        avatar={(
                          <Avatar
                            src={user.profileImage}
                          >
                            {displayName}
                          </Avatar>)}

                        className={classes.chips}
                        color="primary"
                        label={user.fullname}
                        variant="outlined"
                      />
                    </Tooltip>
                  </Grid>
                )
              })
            }
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  )
}

FileViewer.propTypes = {
  file: PropTypes.object.isRequired
}

export default FileViewer;