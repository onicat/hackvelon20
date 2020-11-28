import { Button, FormControl, FormControlLabel, FormLabel, makeStyles, Paper, Radio, RadioGroup, TextField, Typography } from '@material-ui/core';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React from 'react'
import { useParams } from 'react-router-dom';

const serverAddress = 'http://localhost:3001';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 40px',
  },
  element: {
    margin: '10px 0'
  }
}));

const Registration = () => {
  const classes = useStyles();
  const { userId, channelId } = useParams();

  const [name, setName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [about, setAbout] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [birthDate, setBirthDate] = React.useState(new Date());
  const [gender, setGender] = React.useState('female');
  const [preference, setPreference] = React.useState('female');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleAboutChange = (event) => {
    setAbout(event.target.value);
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleBirthDateChange = (date) => {
    setBirthDate(date);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handlePreferenceChange = (event) => {
    setPreference(event.target.value);
  };

  const sendData = async () => {
    try {
      await fetch(serverAddress + '/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          userId,
          channelId,
          name,
          city,
          about,
          tags,
          birthDate,
          gender,
          preference
        })
      });

      alert('Регистрация прошла успешно');
    } catch(e) {
      alert(e.message);
    }
  };

  return (
    <div className={classes.root}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Paper className={classes.paper}>
          <Typography variant='h4'>Регистрация</Typography>
          <TextField
            label='Имя'
            value={name}
            className={classes.element}
            onChange={handleNameChange}
          />
          <TextField
            label='Город'
            value={city}
            className={classes.element}
            onChange={handleCityChange}
          />
          <TextField
            label='О себе'
            multiline
            value={about}
            className={classes.element}
            onChange={handleAboutChange}
          />
          <TextField
            label='Теги (через запятую)'
            value={tags}
            onChange={handleTagsChange}
            className={classes.element}
          />
          <KeyboardDatePicker
            label="Дата рождения"
            format="MM/dd/yyyy"
            value={birthDate}
            onChange={handleBirthDateChange}
            className={classes.element}
          />
          <FormControl className={classes.element}>
            <FormLabel>Пол</FormLabel>
            <RadioGroup value={gender} onChange={handleGenderChange}>
              <FormControlLabel control={<Radio/>} label='Мужской' value='female'/>
              <FormControlLabel control={<Radio/>} label='Женский' value='male'/>
            </RadioGroup>
          </FormControl>
          <FormControl className={classes.element}>
            <FormLabel>Хотел бы познакомиться с</FormLabel>
            <RadioGroup value={preference} onChange={handlePreferenceChange}>
              <FormControlLabel control={<Radio/>} label='С мужчиной' value='female'/>
              <FormControlLabel control={<Radio/>} label='С женщиной' value='male'/>
              <FormControlLabel control={<Radio/>} label='Не важно' value='other'/>
            </RadioGroup>
          </FormControl>
          <Button variant="contained" onClick={sendData} color="primary">Зарегистрироваться</Button>
        </Paper>
      </MuiPickersUtilsProvider>
    </div>
  )
};

export default Registration;