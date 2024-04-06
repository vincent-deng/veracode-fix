export async function checkCWE(flawInfo:any) {
    if (flawInfo.language == 'java'){
        console.log('CWE check for Java')
        const supportedCWEs = [80,89,113,117,327,331,382,470,597,601]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for Java')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.CWE+' is not supported Java')
            return false
        }
    }
    else if (flawInfo.language == 'csharp'){
        console.log('CWE check for C#')
        const supportedCWEs = [80,89,201,209,259,352,404,601,611,798]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for csharp')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported sharp')
            return false
        }
    }
    else if (flawInfo.language == 'javascript'){
        console.log('CWE check for JavaScript')
        const supportedCWEs = [73,78,80,113,117,327,611,614]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for JavaScript')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported JavaScript')
            return false
        }
    }
    else if (flawInfo.language == 'python'){
        console.log('CWE check for Python')
        const supportedCWEs = [73,78,80,89,295,327,331,601,757]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for Python')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported Python')
            return false
        }
    }
    else if (flawInfo.language == 'php'){
        console.log('CWE check for PHP')
        const supportedCWEs = [73,80,89,117]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for PHP')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported PHP')
            return false
        }
    }
    else if (flawInfo.language == 'scala'){
        console.log('CWE check for Scala')
        const supportedCWEs = [78,80,89,117,611]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for Scala')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported Scala')
            return false
        }
    }
    else if (flawInfo.language == 'kotlin'){
        console.log('CWE check for Kotlin')
        const supportedCWEs = [80,89,113,117,331]
        if (supportedCWEs.includes(flawInfo.cweID)){
            console.log('Checks - CWE '+flawInfo.cweID+' is supported for Kotlin')
            return true
        }
        else {
            console.log('Checks - CWE '+flawInfo.cweID+' is not supported Kotlin')
            return false
        }
    }
}