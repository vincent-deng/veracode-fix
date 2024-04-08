import axios from 'axios';
import { calculateAuthorizationHeader } from './auth'
import fs from 'fs';
import FormData from 'form-data';


export async function upload(platform: any, tar: any, options: any) {

    const fileBuffer: Buffer = fs.readFileSync('data.tar.gz');
    const formData = new FormData();
    formData.append('data', fileBuffer, 'data.tar.gz');
    formData.append('name', 'data');

    const authHeader = await calculateAuthorizationHeader({
        id: platform.cleanedID,
        key: platform.cleanedKEY,
        host: platform.apiUrl,
        url: '/fix/v1/project/upload_code',
        method: 'POST',
    })

    if (options.DEBUG == 'true') {
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - upload')
        console.log('Formdata created')
        console.log(formData)
        console.log('ViD: ' + platform.cleanedID + ' Key: ' + platform.cleanedKEY + ' Host: ' + platform.apiUrl + ' URL: fix/v1/project/upload_code' + ' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    console.log('Uploading data.tar.gz to Veracode')

    const response = await axios.post('https://' + platform.apiUrl + '/fix/v1/project/upload_code', formData, {
        headers: {
            'Authorization': authHeader,
            ...formData.getHeaders()
        }
    });

    if (response.status != 200) {
        console.log('Error uploading data')
        if (options.DEBUG == 'true') {
            console.log('#######- DEBUG MODE -#######')
            console.log('requests.ts - upload')
            console.log(response.data)
            console.log('#######- DEBUG MODE -#######')
        }
    }
    else {
        console.log('Data uploaded successfully')
        console.log('Project ID is:')
        console.log(response.data);
        return response.data
    }

}


export async function checkFix(platform: any, projectId: any, options: any) {
    for (let i = 0; i < 10; i++) {
        console.log('Checking for fixes')
        const data = await makeRequest(platform, projectId, options);
        console.log('2======================================');
        console.log(`response data is: ${data}`);
        if (data != 'not ready yet') {
            return data;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    // const data = await makeRequest(platform, projectId, options);
    // console.log('2======================================');
    // console.log(`response data is: ${data}`);
    // return data;
}

async function makeRequest(platform: any, projectId: any, options: any) {
    const authHeader = await calculateAuthorizationHeader({
        id: platform.cleanedID,
        key: platform.cleanedKEY,
        host: platform.apiUrl,
        url: '/fix/v1/project/' + projectId + '/results',
        method: 'GET',
    })

    if (options.DEBUG == 'true') {
        console.log('#######- DEBUG MODE -#######')
        console.log('requests.ts - cehckFix')
        console.log('ViD: ' + platform.cleanedID + ' Key: ' + platform.cleanedKEY + ' Host: ' + platform.apiUrl + ' URL: /fix/v1/project/' + projectId + '/results' + ' Method: POST')
        console.log('Auth header created')
        console.log(authHeader)
        console.log('#######- DEBUG MODE -#######')
    }

    const response = await axios.get('https://' + platform.apiUrl + '/fix/v1/project/' + projectId + '/results', {
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
        }
    })

    // const headers = {
    //     Authorization: authHeader,
    //     'Content-Type': 'application/json'
    // };

    // const appUrl = 'https://' + platform.apiUrl + '/fix/v1/project/' + projectId + '/results';

    // const response = await fetch(appUrl, { headers });
    console.log('3======================================');
    console.log(response);
    try {
        return response.data;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return 'not ready yet';
    }
    // if (!response.ok) {
    //     throw new Error('Network response was not ok');
    // }
    // console.log('1====================================');
    // console.log(response);
    // const data = await response.text();
    // return data;

    // .then(async response => {
    //     if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //     }

    //   // Parse as text
    //   return response.text()

    // })
    // .then(async data => {
    //   console.log('Response data:')
    //   console.log(data);
    //   if ( !data || data == ''){
    //       console.log('Response is empty. Retrying in 10 seconds.');
    //       console.log('Response:')
    //       console.log(data);
    //       await new Promise(resolve => setTimeout(resolve, 10000));
    //       await makeRequest(platform, projectId, options);
    // } else {
    //         console.log('Fixes fetched successfully');
    //         console.log('Response:')
    //         console.log(data);
    //         return data;
    //     }
    // })
    // .catch(error => {
    //   console.error('Fetch error:', error);
    // });




    /*     if (!data || data.length == 0) {
            console.log('Response is empty. Retrying in 10 seconds.');
            console.log('Response:')
            console.log(data);
            await new Promise(resolve => setTimeout(resolve, 10000));
            await makeRequest(platform, projectId, options);
        } else {
            console.log('Fixes fetched successfully');
            console.log('Response:')
            console.log(data);
            return data;
        } */
}