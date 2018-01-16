import {connect} from 'react-redux';
import _Header from '../components/Header';

const mapStateToProps = state => {
	return {
		selection: 'all'
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

const Header = connect(
	mapStateToProps,
	mapDispatchToProps
)(_Header);

export default Header;