import {connect} from 'react-redux';
import _FileManager from '../components/FileManager';
import {TestFolders} from '../lib/TestData';

const defaultFolders = TestFolders;

const mapStateToProps = state => {
	return {
		shownFolders: defaultFolders,
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

const FileManager = connect(
	mapStateToProps,
	mapDispatchToProps
)(_FileManager);

export default FileManager;