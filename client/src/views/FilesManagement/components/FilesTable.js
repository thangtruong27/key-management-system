/* eslint-disable react/no-multi-comp */
import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  IconButton,
  Checkbox,
  Paper,
  TableRow,
  Typography,
  Toolbar,
  Tooltip,
  TableSortLabel
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { GetApp, Visibility as ViewIcon } from '@material-ui/icons';
import FilterListIcon from '@material-ui/icons/FilterList';

import { StatusBullet, DeleteConfirmDialog, FileViewer } from 'components';
import moment from 'moment';

import { useDispatch } from 'react-redux';
import { Actions } from 'state/modules/app/files'
function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const headRows = [
  { id: 'name', label: 'Name' },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'size', label: 'Size' },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            checked={numSelected === rowCount}
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            inputProps={{ 'aria-label': 'Select all desserts' }}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headRows.map(row => (
          <TableCell
            align="left"
            key={row.id}
            padding="default"
            sortDirection={orderBy === row.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === row.id}
              direction={order}
              onClick={createSortHandler(row.id)}
            >
              {row.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected, onViewDetail, onDownload } = props;

  const handleViewClick = (e) => {
    e.preventDefault();
    onViewDetail && onViewDetail();
  }

  const handleDownloadClick = (e) => {
    e.preventDefault();
    onDownload && onDownload();
  }

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography
            color="inherit"
            variant="subtitle1"
          >
            {numSelected} selected
          </Typography>
        ) :
          (
            <Typography
              id="tableTitle"
              variant="h6"
            >
              All keys
            </Typography>
          )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <div style={{ display: 'flex' }}>
            {
              numSelected === 1 &&
              (
                <>
                  <Tooltip title="View detail">
                    <IconButton
                      aria-label="View detail"
                      onClick={handleViewClick}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton
                      aria-label="Download"
                      onClick={handleDownloadClick}
                    >
                      <GetApp />
                    </IconButton>
                  </Tooltip>
                </>
              )
            }
            <Tooltip title="Delete">
              <IconButton aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        ) :
          (
            <Tooltip title="Filter list">
              <IconButton aria-label="Filter list">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDownload: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  status: {
    marginRight: theme.spacing(1)
  },
}));

export default function FilesTable(props) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const { files: rows } = props;
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openFileDetail, setOpenFileDetail] = React.useState(false);

  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleSelectAllClick(event) {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }

  function handleClick(event, _id) {
    const selectedIndex = selected.indexOf(_id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, _id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  }

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  function hanleOpenFileDetail() {
    setOpenFileDetail(true);
  }

  function handleCloseFileDetail() {
    setOpenFileDetail(false);
  }

  function downloadFile() {
    selected && dispatch(Actions.downloadFile(selected));
  }
  const isSelected = _id => selected.indexOf(_id) !== -1;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onDownload={downloadFile}
          onViewDetail={hanleOpenFileDetail}
        />
        <div className={classes.tableWrapper}>
          <Table
            aria-labelledby="tableTitle"
            className={classes.table}
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
              order={order}
              orderBy={orderBy}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row._id);
                  const labelId = `checkbox-${index}`;

                  return (
                    <TableRow
                      aria-checked={isItemSelected}
                      hover
                      key={row._id}
                      onClick={event => handleClick(event, row._id)}
                      role="checkbox"
                      selected={isItemSelected}
                      tabIndex={-1}
                    >
                      <TableCell
                        align="left"
                        padding="checkbox"
                      >
                        <Checkbox
                          checked={isItemSelected}
                          color="primary"
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        padding="none"
                        scope="row"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.owner.fullname}</TableCell>
                      <TableCell align="left">
                        <div className={classes.statusContainer}>
                          <StatusBullet
                            className={classes.status}
                            size="sm"
                            type={row.status}
                          />
                          {row.status}
                        </div>
                      </TableCell>
                      <TableCell align="left">
                        {Math.floor(row.size / 1024)} KB
                      </TableCell>
                    </TableRow>
                  );
                })}

            </TableBody>
          </Table>
        </div>
        <TablePagination
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          component="div"
          count={rows.length}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
      <DeleteConfirmDialog />
      <FileViewer
        fileId={selected}
        onClose={handleCloseFileDetail}
        open={openFileDetail}
      />
    </div>
  );
}
FilesTable.propTypes = {
  className: PropTypes.string,
  files: PropTypes.array.isRequired
};
